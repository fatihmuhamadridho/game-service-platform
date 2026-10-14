import { db } from '@prisma/db';
import { NextResponse } from 'next/server';
import { enforceAuthRateLimit } from '@backend/auth/auth-rate-limit';
import { issueOrderTrackingToken } from '@backend/order/tracking-token.service';

const fail = (code: string, message: string, status: number) =>
  NextResponse.json({ status: { code, message }, data: null }, { status, headers: { 'Cache-Control': 'no-store' } });
const normalizePhone = (value: string) => {
  const digits = value.replace(/\D/g, '');
  return digits.startsWith('0')
    ? `+62${digits.slice(1)}`
    : digits.startsWith('62')
      ? `+${digits}`
      : value.startsWith('+')
        ? `+${digits}`
        : `+62${digits}`;
};
const maskPhone = (phone: string) => (phone.length > 7 ? `${phone.slice(0, 5)}••••${phone.slice(-3)}` : '••••••');
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

export async function POST(request: Request) {
  const ipLimit = await enforceAuthRateLimit(request, 'order-tracking');
  if (ipLimit) return ipLimit;
  const declaredLength = Number(request.headers.get('content-length') ?? 0);
  if (declaredLength > 4096) return fail('ORDB02001', 'Data pelacakan tidak valid.', 400);
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return fail('ORDB02001', 'Data pelacakan tidak valid.', 400);
  }
  if (
    !body ||
    typeof body !== 'object' ||
    Array.isArray(body) ||
    Object.keys(body).some((key) => !['orderNumber', 'whatsapp'].includes(key))
  )
    return fail('ORDB02001', 'Data pelacakan tidak valid.', 400);
  const orderNumber = typeof body.orderNumber === 'string' ? body.orderNumber.trim().toUpperCase() : '';
  const rawPhone = typeof body.whatsapp === 'string' ? body.whatsapp.trim() : '';
  if (
    !/^JH-\d{8}-[A-F0-9]{6}$/.test(orderNumber) ||
    rawPhone.length > 32 ||
    rawPhone.length < 8 ||
    !/^\+?[\d\s()-]+$/.test(rawPhone)
  ) {
    return fail('ORDB02001', 'Data pelacakan tidak valid.', 400);
  }
  if (!/^\+[1-9]\d{7,14}$/.test(normalizePhone(rawPhone))) {
    return fail('ORDB02001', 'Data pelacakan tidak valid.', 400);
  }
  const subjectLimit = await enforceAuthRateLimit(
    request,
    'order-tracking',
    `${orderNumber}:${normalizePhone(rawPhone)}`
  );
  if (subjectLimit) return subjectLimit;

  try {
    const order = await db.orm.customer_order
      .where({ order_number: orderNumber })
      .include('items')
      .include('payments')
      .include('status_history')
      .first();
    const submittedPhone = normalizePhone(rawPhone);
    if (!order || normalizePhone(order.customer_whatsapp) !== submittedPhone) {
      return fail('ORDB02002', 'Pesanan tidak dapat diverifikasi. Periksa nomor pesanan dan WhatsApp.', 400);
    }

    const paymentHistoryGroups = await Promise.all(
      order.payments.map((payment) => db.orm.payment_status_history.where({ payment_id: payment._id }).all())
    );
    const timeline = [
      ...order.status_history.map((event) => ({
        type: 'order',
        status: event.new_status,
        label: orderLabels[event.new_status] ?? 'Status pesanan diperbarui',
        description: null,
        occurredAt: event.changed_at,
      })),
      ...paymentHistoryGroups.flat().map((event) => ({
        type: 'payment',
        status: event.new_status,
        label: paymentLabels[event.new_status] ?? 'Status pembayaran diperbarui',
        description: null,
        occurredAt: event.changed_at,
      })),
    ]
      .sort((a, b) => a.occurredAt.getTime() - b.occurredAt.getTime())
      .slice(-50)
      .map((event) => ({
        status: event.status,
        label: event.label,
        description: event.description,
        occurredAt: event.occurredAt.toISOString(),
      }));
    const tracking = await issueOrderTrackingToken(String(order._id));
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
            customerWhatsappMasked: maskPhone(order.customer_whatsapp),
          },
          timeline,
          trackingToken: tracking.token,
          trackingTokenExpiresAt: tracking.expiresAt,
        },
      },
      { headers: { 'Cache-Control': 'no-store', Pragma: 'no-cache' } }
    );
  } catch {
    return fail('ORDT03001', 'Pelacakan pesanan sedang tidak tersedia.', 500);
  }
}
