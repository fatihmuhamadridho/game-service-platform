import { ObjectId } from 'mongodb';
import { db } from '@prisma/db';
import { NextResponse } from 'next/server';
import { enforceAuthRateLimit } from '@backend/auth/auth-rate-limit';
import { resolveOrderTrackingToken } from '@backend/order/tracking-token.service';

const fail = () =>
  NextResponse.json(
    {
      status: { code: 'ORDB02002', message: 'Pesanan tidak dapat diverifikasi. Silakan cek pesanan kembali.' },
      data: null,
    },
    { status: 400, headers: { 'Cache-Control': 'no-store', Pragma: 'no-cache' } }
  );
const unavailable = () =>
  NextResponse.json(
    { status: { code: 'ORDT03001', message: 'Pelacakan pesanan sedang tidak tersedia.' }, data: null },
    { status: 500, headers: { 'Cache-Control': 'no-store', Pragma: 'no-cache' } }
  );
const orderLabels: Record<string, string> = {
  PENDING_PAYMENT: 'Menunggu pembayaran',
  PENDING_VALIDATION: 'Menunggu verifikasi pembayaran',
  PROCESSING: 'Pesanan sedang diproses',
  COMPLETED: 'Pesanan selesai',
  CANCELLED: 'Pesanan dibatalkan',
};
const paymentLabels: Record<string, string> = {
  UNPAID: 'Menunggu pembayaran',
  PENDING_REVIEW: 'Menunggu verifikasi pembayaran',
  PAID: 'Pembayaran terverifikasi',
  FAILED: 'Pembayaran ditolak atau kedaluwarsa',
  EXPIRED: 'Pembayaran kedaluwarsa',
  REFUNDED: 'Pembayaran dikembalikan',
};

export async function GET(request: Request, { params }: RouteContext<'/api/orders/v1/tracking/[orderNumber]/status'>) {
  const { orderNumber: rawOrderNumber } = await params;
  const orderNumber = rawOrderNumber.toUpperCase();
  const query = new URL(request.url).searchParams;
  const resultView = query.get('view') === 'result';
  if ([...query.keys()].some((key) => key !== 'view') || (query.has('view') && !resultView)) return fail();
  const token =
    request.headers
      .get('authorization')
      ?.replace(/^Bearer\s+/i, '')
      .trim() ?? '';
  if (!/^JH-\d{8}-[A-F0-9]{6}$/.test(orderNumber) || !token) return fail();
  const ipLimit = await enforceAuthRateLimit(request, 'order-tracking');
  if (ipLimit) return ipLimit;
  const subjectLimit = await enforceAuthRateLimit(request, 'order-tracking', token);
  if (subjectLimit) return subjectLimit;
  let scope: { orderId: string } | null;
  try {
    scope = await resolveOrderTrackingToken(token);
  } catch {
    return unavailable();
  }
  if (!scope || !ObjectId.isValid(scope.orderId)) return fail();
  try {
    const order = await db.orm.customer_order
      .where({ _id: scope.orderId, order_number: orderNumber })
      .include('items')
      .include('payments')
      .include('status_history')
      .first();
    if (!order) return fail();
    if (resultView && !['PENDING_REVIEW', 'PAID'].includes(order.payment_status)) {
      return NextResponse.json(
        {
          status: { code: 'ORDB02004', message: 'Hasil pembayaran tersedia setelah pembayaran dilaporkan.' },
          data: null,
        },
        { status: 409, headers: { 'Cache-Control': 'no-store', Pragma: 'no-cache' } }
      );
    }
    const paymentHistoryGroups = await Promise.all(
      order.payments.map((payment) => db.orm.payment_status_history.where({ payment_id: payment._id }).all())
    );
    const timeline = [
      ...order.status_history.map((event) => ({
        status: event.new_status,
        label: orderLabels[event.new_status] ?? 'Status pesanan diperbarui',
        occurredAt: event.changed_at,
      })),
      ...paymentHistoryGroups.flat().map((event) => ({
        status: event.new_status,
        label: paymentLabels[event.new_status] ?? 'Status pembayaran diperbarui',
        occurredAt: event.changed_at,
      })),
    ]
      .sort((a, b) => a.occurredAt.getTime() - b.occurredAt.getTime())
      .slice(-50)
      .map((event) => ({
        status: event.status,
        label: event.label,
        description: null,
        occurredAt: event.occurredAt.toISOString(),
      }));
    return NextResponse.json(
      {
        status: { code: 'ORDS00000', message: 'Status pesanan berhasil diambil.' },
        data: {
          order: {
            orderNumber: order.order_number,
            status: order.order_status,
            statusLabel: orderLabels[order.order_status] ?? 'Status pesanan diperbarui',
            paymentStatus: order.payment_status,
            paymentStatusLabel: paymentLabels[order.payment_status] ?? 'Status pembayaran diperbarui',
            gameName: order.items[0]?.game_name_snapshot ?? 'Game',
            serviceName: order.items[0]?.service_name_snapshot ?? 'Layanan',
            createdAt: order.created_at.toISOString(),
            updatedAt: order.updated_at.toISOString(),
            customerWhatsappMasked:
              order.customer_whatsapp.length > 7
                ? `${order.customer_whatsapp.slice(0, 5)}••••${order.customer_whatsapp.slice(-3)}`
                : '••••••',
          },
          timeline,
          dataAsOf: new Date().toISOString(),
        },
      },
      { headers: { 'Cache-Control': 'no-store', Pragma: 'no-cache' } }
    );
  } catch {
    return unavailable();
  }
}
