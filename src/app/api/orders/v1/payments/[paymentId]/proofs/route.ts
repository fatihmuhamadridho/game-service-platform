import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';
import { db } from '@prisma/db';
import { enforceAuthRateLimit } from '@backend/auth/auth-rate-limit';
import {
  deletePrivateObject,
  isPaymentProofUploadPath,
  isPrivateStorageConfigured,
  PrivateStorageError,
  storePrivatePaymentProof,
} from '@backend/order/private-object-storage.service';
import { resolveOrderTrackingToken } from '@backend/order/tracking-token.service';
import { FEATURE_SPRINT_2 } from '@configs/base.config';

export const runtime = 'nodejs';

const failure = (code: string, message: string, status: number) =>
  NextResponse.json({ status: { code, message }, data: null }, { status, headers: { 'Cache-Control': 'no-store' } });

export async function POST(request: Request, context: { params: Promise<{ paymentId: string }> }) {
  if (!FEATURE_SPRINT_2) return failure('ORDT04004', 'Fitur bukti pembayaran sedang dinonaktifkan.', 404);
  const { paymentId } = await context.params;
  if (!ObjectId.isValid(paymentId)) return failure('ORDB02001', 'Payment ID tidak valid.', 400);
  const ipLimit = await enforceAuthRateLimit(request, 'payment-proof');
  if (ipLimit) return ipLimit;

  const token =
    request.headers
      .get('authorization')
      ?.replace(/^Bearer\s+/i, '')
      .trim() ?? '';
  if (!token) return failure('ORDB02002', 'Akses pesanan perlu diverifikasi.', 401);
  const subjectLimit = await enforceAuthRateLimit(request, 'payment-proof', paymentId);
  if (subjectLimit) return subjectLimit;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return failure('ORDB02001', 'Data bukti pembayaran tidak valid.', 400);
  }
  if (
    !body ||
    typeof body !== 'object' ||
    Array.isArray(body) ||
    Object.keys(body).some((key) => !['orderNumber', 'pathname'].includes(key)) ||
    typeof body.orderNumber !== 'string' ||
    !/^JH-\d{8}-[A-F0-9]{6}$/.test(body.orderNumber) ||
    typeof body.pathname !== 'string' ||
    !isPaymentProofUploadPath(paymentId, body.pathname)
  ) {
    return failure('ORDB02003', 'Pilih gambar JPG atau PNG dengan ukuran maksimal 5 MB.', 400);
  }
  if (!isPrivateStorageConfigured()) {
    return failure('ORDT04001', 'Penyimpanan bukti pembayaran belum dikonfigurasi.', 503);
  }

  let scope: { orderId: string } | null;
  try {
    scope = await resolveOrderTrackingToken(token);
  } catch {
    return failure('ORDT03001', 'Detail pesanan sementara tidak tersedia.', 500);
  }
  if (!scope || !ObjectId.isValid(scope.orderId)) return failure('ORDB02002', 'Akses pesanan perlu diverifikasi.', 401);

  let uploadedKey = '';
  let proofId = '';
  let historyId = '';
  let orderHistoryId = '';
  let paymentClaimed = false;
  let paymentOrderId = '';
  let previousOrderStatus = '';
  let previousOrderPaymentStatus = '';
  try {
    const payment = await db.orm.order_payment.where({ _id: paymentId }).include('order').first();
    if (!payment || String(payment.order._id) !== scope.orderId || payment.order.order_number !== body.orderNumber) {
      return failure('ORDB02002', 'Pesanan tidak ditemukan atau tidak cocok.', 404);
    }
    paymentOrderId = String(payment.order._id);
    previousOrderStatus = payment.order.order_status;
    previousOrderPaymentStatus = payment.order.payment_status;
    if (!payment.order.expires_at || payment.order.expires_at <= new Date()) {
      await deletePrivateObject(body.pathname).catch(() => undefined);
      return failure('ORDB02002', 'Pesanan sudah kedaluwarsa.', 404);
    }
    if (payment.status === 'PENDING_REVIEW') {
      const existingProof = (await db.orm.payment_proof.where({ payment_id: paymentId }).all())[0];
      await deletePrivateObject(body.pathname).catch(() => undefined);
      if (existingProof) {
        return NextResponse.json(
          {
            status: { code: 'ORDS00000', message: 'Bukti pembayaran sudah diterima.' },
            data: { status: 'PENDING_REVIEW' },
          },
          { status: 200, headers: { 'Cache-Control': 'no-store' } }
        );
      }
      return failure('ORDB02004', 'Upload bukti pembayaran sedang diproses.', 409);
    }
    if (payment.status !== 'UNPAID') {
      await deletePrivateObject(body.pathname).catch(() => undefined);
      return failure('ORDB02002', 'Payment tidak dapat menerima bukti pembayaran.', 409);
    }

    const image = await storePrivatePaymentProof(paymentId, body.pathname);
    uploadedKey = image.objectKey;
    const now = new Date();
    const claimed = await db.orm.order_payment.where({ _id: paymentId, status: 'UNPAID' }).updateAndCount({
      status: 'PENDING_REVIEW',
      submitted_at: now,
      reviewed_by: null,
      reviewed_at: null,
      review_note: null,
      updated_at: now,
    });
    if (claimed !== 1) {
      await deletePrivateObject(uploadedKey);
      uploadedKey = '';
      const existingProof = (await db.orm.payment_proof.where({ payment_id: paymentId }).all())[0];
      if (existingProof) {
        return NextResponse.json(
          {
            status: { code: 'ORDS00000', message: 'Bukti pembayaran sudah diterima.' },
            data: { status: 'PENDING_REVIEW' },
          },
          { status: 200, headers: { 'Cache-Control': 'no-store' } }
        );
      }
      return failure('ORDB02004', 'Payment sedang berubah. Coba kirim ulang.', 409);
    }
    paymentClaimed = true;
    await db.orm.customer_order.where({ _id: paymentOrderId }).update({
      payment_status: 'PENDING_REVIEW',
      order_status: 'PENDING_VALIDATION',
      updated_at: now,
    });

    proofId = new ObjectId().toHexString();
    await db.orm.payment_proof.create({
      _id: proofId,
      payment_id: paymentId,
      object_key: uploadedKey,
      mime_type: image.mimeType,
      file_size_bytes: image.fileSizeBytes,
      uploaded_at: now,
      uploaded_by: null,
    });
    historyId = new ObjectId().toHexString();
    await db.orm.payment_status_history.create({
      _id: historyId,
      payment_id: paymentId,
      old_status: 'UNPAID',
      new_status: 'PENDING_REVIEW',
      changed_by: null,
      reason: 'Customer mengirim bukti pembayaran.',
      changed_at: now,
    });
    orderHistoryId = new ObjectId().toHexString();
    await db.orm.order_status_history.create({
      _id: orderHistoryId,
      order_id: paymentOrderId,
      old_status: previousOrderStatus,
      new_status: 'PENDING_VALIDATION',
      changed_by: null,
      reason: 'Pelanggan mengirim bukti pembayaran; menunggu validasi admin.',
      changed_at: now,
    });
    return NextResponse.json(
      {
        status: { code: 'ORDS00000', message: 'Bukti diterima dan menunggu pemeriksaan admin.' },
        data: { id: proofId, status: 'PENDING_REVIEW' },
      },
      { status: 201, headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    if (orderHistoryId)
      await db.orm.order_status_history
        .where({ _id: orderHistoryId })
        .delete()
        .catch(() => undefined);
    if (historyId)
      await db.orm.payment_status_history
        .where({ _id: historyId })
        .delete()
        .catch(() => undefined);
    if (proofId)
      await db.orm.payment_proof
        .where({ _id: proofId })
        .delete()
        .catch(() => undefined);
    if (paymentClaimed && paymentOrderId) {
      await db.orm.order_payment
        .where({ _id: paymentId, status: 'PENDING_REVIEW' })
        .update({ status: 'UNPAID', submitted_at: null, updated_at: new Date() })
        .catch(() => undefined);
      await db.orm.customer_order
        .where({ _id: paymentOrderId })
        .update({
          payment_status: previousOrderPaymentStatus || 'UNPAID',
          order_status: previousOrderStatus || 'PENDING_PAYMENT',
          updated_at: new Date(),
        })
        .catch(() => undefined);
    }
    if (uploadedKey) await deletePrivateObject(uploadedKey).catch(() => undefined);
    if (error instanceof PrivateStorageError)
      return failure(error.code === 'INVALID_IMAGE' ? 'ORDB02003' : 'ORDT04001', error.message, error.status);
    return failure('ORDT03001', 'Bukti pembayaran tidak dapat disimpan saat ini.', 500);
  }
}
