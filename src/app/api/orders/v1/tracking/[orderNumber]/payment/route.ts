import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';
import { db } from '@prisma/db';
import { enforceAuthRateLimit } from '@backend/auth/auth-rate-limit';
import { CheckoutError, getPaymentInstructions, reportPaymentAsPaid } from '@backend/order/checkout.service';
import { resolveOrderTrackingToken } from '@backend/order/tracking-token.service';

type Context = RouteContext<'/api/orders/v1/tracking/[orderNumber]/payment'>;
const fail = (code: string, message: string, status: number) =>
  NextResponse.json({ status: { code, message }, data: null }, { status, headers: { 'Cache-Control': 'no-store' } });

async function getAuthorizedOrder(request: Request, orderNumber: string) {
  const token =
    request.headers
      .get('authorization')
      ?.replace(/^Bearer\s+/i, '')
      .trim() ?? '';
  if (!token) return { response: fail('ORDB02002', 'Akses pesanan perlu diverifikasi.', 401) };
  const ipLimit = await enforceAuthRateLimit(request, 'order-tracking');
  if (ipLimit) return { response: ipLimit };
  const subjectLimit = await enforceAuthRateLimit(request, 'order-tracking', token);
  if (subjectLimit) return { response: subjectLimit };
  let scope: { orderId: string } | null;
  try {
    scope = await resolveOrderTrackingToken(token);
  } catch {
    return { response: fail('ORDT03001', 'Detail pembayaran sementara tidak tersedia.', 500) };
  }
  if (!scope || !ObjectId.isValid(scope.orderId))
    return { response: fail('ORDB02002', 'Akses pesanan perlu diverifikasi.', 401) };
  try {
    const order = await db.orm.customer_order
      .where({ _id: scope.orderId, order_number: orderNumber })
      .include('items')
      .include('payments')
      .first();
    if (!order) return { response: fail('ORDB02002', 'Pesanan tidak ditemukan.', 404) };
    const payment = order.payments[0];
    const item = order.items[0];
    if (!payment || !item) return { response: fail('ORDB02002', 'Detail pesanan tidak tersedia.', 404) };
    return { order, payment, item };
  } catch {
    return { response: fail('ORDT03001', 'Detail pembayaran sementara tidak tersedia.', 500) };
  }
}

export async function GET(request: Request, { params }: Context) {
  const { orderNumber: rawOrderNumber } = await params;
  const orderNumber = rawOrderNumber.toUpperCase();
  if (!/^JH-\d{8}-[A-F0-9]{6}$/.test(orderNumber)) return fail('ORDB02001', 'Nomor pesanan tidak valid.', 400);
  const result = await getAuthorizedOrder(request, orderNumber);
  if ('response' in result) return result.response;
  const { order, payment, item } = result;
  const instructions = getPaymentInstructions(payment.method as 'QRIS' | 'BCA_TRANSFER');
  if (!instructions) return fail('ORDB02004', 'Instruksi pembayaran tidak tersedia.', 503);
  return NextResponse.json(
    {
      status: { code: 'ORDS00000', message: 'Detail pembayaran berhasil diambil.' },
      data: {
        order: {
          orderNumber: order.order_number,
          orderStatus: order.order_status,
          paymentStatus: payment.status,
          totalAmount: Number(order.total_amount),
          expiresAt: order.expires_at?.toISOString() ?? null,
          game: item.game_name_snapshot,
          service: item.service_name_snapshot,
          quantity: item.quantity,
        },
        payment: {
          id: String(payment._id),
          method: payment.method,
          amount: Number(payment.amount),
          instructions: { ...instructions, reference: payment.reference_note },
        },
      },
    },
    { headers: { 'Cache-Control': 'no-store', Pragma: 'no-cache' } }
  );
}

export async function POST(request: Request, { params }: Context) {
  const { orderNumber: rawOrderNumber } = await params;
  const orderNumber = rawOrderNumber.toUpperCase();
  if (!/^JH-\d{8}-[A-F0-9]{6}$/.test(orderNumber)) return fail('ORDB02001', 'Nomor pesanan tidak valid.', 400);
  const result = await getAuthorizedOrder(request, orderNumber);
  if ('response' in result) return result.response;
  try {
    const data = await reportPaymentAsPaid({
      paymentId: String(result.payment._id),
      orderNumber,
      whatsapp: result.order.customer_whatsapp,
    });
    return NextResponse.json(
      { status: { code: 'ORDS00000', message: 'Konfirmasi pembayaran berhasil dikirim.' }, data },
      { headers: { 'Cache-Control': 'no-store', Pragma: 'no-cache' } }
    );
  } catch (error) {
    const failure =
      error instanceof CheckoutError ? error : new CheckoutError('ORDT03001', 'Konfirmasi pembayaran gagal.', 500);
    return fail(failure.code, failure.message, failure.status);
  }
}
