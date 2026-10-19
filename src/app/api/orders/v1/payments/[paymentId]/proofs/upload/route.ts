import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';
import { db } from '@prisma/db';
import { enforceAuthRateLimit } from '@backend/auth/auth-rate-limit';
import { isPaymentProofUploadPath, isPrivateStorageConfigured } from '@backend/order/private-object-storage.service';
import { resolveOrderTrackingToken } from '@backend/order/tracking-token.service';
import { FEATURE_SPRINT_2 } from '@configs/base.config';

export const runtime = 'nodejs';

const failure = (code: string, message: string, status: number) =>
  NextResponse.json({ status: { code, message }, data: null }, { status, headers: { 'Cache-Control': 'no-store' } });

type UploadPayload = { orderNumber: string; trackingToken: string };

export async function POST(request: Request, context: { params: Promise<{ paymentId: string }> }) {
  if (!FEATURE_SPRINT_2) return failure('ORDT04004', 'Fitur bukti pembayaran sedang dinonaktifkan.', 404);
  const { paymentId } = await context.params;
  if (!ObjectId.isValid(paymentId)) return failure('ORDB02001', 'Payment ID tidak valid.', 400);
  if (!isPrivateStorageConfigured()) {
    return failure('ORDT04001', 'Penyimpanan bukti pembayaran belum dikonfigurasi.', 503);
  }
  const ipLimit = await enforceAuthRateLimit(request, 'payment-proof');
  if (ipLimit) return ipLimit;

  let body: HandleUploadBody;
  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return failure('ORDB02001', 'Data upload bukti tidak valid.', 400);
  }

  try {
    const response = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        let payload: UploadPayload;
        try {
          payload = JSON.parse(clientPayload ?? '') as UploadPayload;
        } catch {
          throw new Error('Akses pesanan perlu diverifikasi.');
        }
        if (
          !payload ||
          typeof payload !== 'object' ||
          !/^JH-\d{8}-[A-F0-9]{6}$/.test(payload.orderNumber) ||
          typeof payload.trackingToken !== 'string' ||
          !isPaymentProofUploadPath(paymentId, pathname)
        ) {
          throw new Error('Data upload bukti tidak valid.');
        }

        const subjectLimit = await enforceAuthRateLimit(request, 'payment-proof', paymentId);
        if (subjectLimit) throw new Error('Batas upload tercapai. Coba beberapa saat lagi.');
        const scope = await resolveOrderTrackingToken(payload.trackingToken);
        if (!scope || !ObjectId.isValid(scope.orderId)) throw new Error('Akses pesanan perlu diverifikasi.');
        const payment = await db.orm.order_payment.where({ _id: paymentId }).include('order').first();
        if (
          !payment ||
          String(payment.order._id) !== scope.orderId ||
          payment.order.order_number !== payload.orderNumber ||
          payment.status !== 'UNPAID' ||
          !payment.order.expires_at ||
          payment.order.expires_at <= new Date()
        ) {
          throw new Error('Pesanan tidak dapat menerima bukti pembayaran.');
        }

        return {
          allowedContentTypes: ['image/jpeg', 'image/png'],
          maximumSizeInBytes: 5 * 1024 * 1024,
          validUntil: Date.now() + 5 * 60 * 1000,
          addRandomSuffix: false,
          tokenPayload: JSON.stringify({ paymentId }),
        };
      },
      onUploadCompleted: async () => undefined,
    });
    return NextResponse.json(response, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload bukti pembayaran gagal.';
    return failure('ORDB02002', message, 400);
  }
}
