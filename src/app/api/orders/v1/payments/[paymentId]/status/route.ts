import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';
import { db } from '@prisma/db';
import { enforceAuthRateLimit } from '@backend/auth/auth-rate-limit';

const failure = (code: string, message: string, status: number) =>
  NextResponse.json({ status: { code, message }, data: null }, { status, headers: { 'Cache-Control': 'no-store' } });
const normalizeWhatsapp = (value: string) => {
  const digits = value.replace(/\D/g, '');
  return digits.startsWith('0') ? `+62${digits.slice(1)}` : digits.startsWith('62') ? `+${digits}` : `+${digits}`;
};

export async function GET(request: Request, context: { params: Promise<{ paymentId: string }> }) {
  const { paymentId } = await context.params;
  if (!ObjectId.isValid(paymentId)) return failure('ORDB02001', 'Payment ID tidak valid.', 400);
  const ipLimit = await enforceAuthRateLimit(request, 'payment-status');
  if (ipLimit) return ipLimit;
  const query = new URL(request.url).searchParams;
  const orderNumber = query.get('orderNumber')?.trim() ?? '';
  const rawWhatsapp = query.get('whatsapp')?.trim() ?? '';
  if (
    [...query.keys()].some((key) => !['orderNumber', 'whatsapp'].includes(key)) ||
    !/^JH-\d{8}-[A-F0-9]{6}$/.test(orderNumber) ||
    rawWhatsapp.length < 8 ||
    rawWhatsapp.length > 32
  )
    return failure('ORDB02001', 'Data verifikasi pembayaran tidak valid.', 400);
  const subjectLimit = await enforceAuthRateLimit(
    request,
    'payment-status',
    `${paymentId}:${orderNumber}:${rawWhatsapp}`
  );
  if (subjectLimit) return subjectLimit;

  try {
    const payment = await db.orm.order_payment.where({ _id: paymentId }).include('order').first();
    if (
      !payment ||
      payment.order.order_number !== orderNumber ||
      payment.order.customer_whatsapp !== normalizeWhatsapp(rawWhatsapp)
    )
      return failure('ORDB02002', 'Pesanan tidak dapat diverifikasi.', 404);
    const expiresAt = payment.order.expires_at?.toISOString() ?? null;
    const retryAllowed =
      payment.status === 'UNPAID' && Boolean(payment.order.expires_at && payment.order.expires_at > new Date());
    return NextResponse.json(
      {
        status: { code: 'ORDS00000', message: 'Status pembayaran berhasil diambil.' },
        data: {
          paymentStatus: payment.status,
          reviewNote: payment.status === 'UNPAID' ? payment.review_note : null,
          expiresAt,
          retryAllowed,
        },
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch {
    return failure('ORDT03001', 'Status pembayaran sementara tidak tersedia.', 500);
  }
}
