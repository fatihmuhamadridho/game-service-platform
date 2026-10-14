import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';
import { enforceAuthRateLimit } from '@backend/auth/auth-rate-limit';
import { CheckoutError, reportPaymentAsPaid } from '@backend/order/checkout.service';

const fail = (code: string, message: string, status: number) =>
  NextResponse.json({ status: { code, message }, data: null }, { status, headers: { 'Cache-Control': 'no-store' } });
const normalizeWhatsapp = (value: string) => {
  const digits = value.replace(/\D/g, '');
  return digits.startsWith('0') ? `+62${digits.slice(1)}` : digits.startsWith('62') ? `+${digits}` : `+${digits}`;
};

export async function POST(request: Request, context: { params: Promise<{ paymentId: string }> }) {
  const { paymentId } = await context.params;
  if (!ObjectId.isValid(paymentId)) return fail('ORDB02001', 'Payment ID tidak valid.', 400);
  const ipLimit = await enforceAuthRateLimit(request, 'payment-status');
  if (ipLimit) return ipLimit;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return fail('ORDB02001', 'Data konfirmasi pembayaran tidak valid.', 400);
  }
  if (
    !body ||
    typeof body !== 'object' ||
    Array.isArray(body) ||
    Object.keys(body).some((key) => !['orderNumber', 'whatsapp'].includes(key)) ||
    typeof body.orderNumber !== 'string' ||
    !/^JH-\d{8}-[A-F0-9]{6}$/.test(body.orderNumber) ||
    typeof body.whatsapp !== 'string' ||
    body.whatsapp.length < 8 ||
    body.whatsapp.length > 32
  ) {
    return fail('ORDB02001', 'Periksa kembali nomor pesanan dan WhatsApp.', 400);
  }
  const whatsapp = normalizeWhatsapp(body.whatsapp);
  const subjectLimit = await enforceAuthRateLimit(
    request,
    'payment-status',
    `${paymentId}:${body.orderNumber}:${whatsapp}`
  );
  if (subjectLimit) return subjectLimit;

  try {
    const data = await reportPaymentAsPaid({ paymentId, orderNumber: body.orderNumber, whatsapp });
    return NextResponse.json(
      { status: { code: 'ORDS00000', message: 'Konfirmasi pembayaran terkirim untuk validasi admin.' }, data },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    const failure =
      error instanceof CheckoutError ? error : new CheckoutError('ORDT03001', 'Konfirmasi pembayaran gagal.', 500);
    return fail(failure.code, failure.message, failure.status);
  }
}
