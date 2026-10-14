import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';
import { db } from '@prisma/db';
import { enforceAuthRateLimit } from '@backend/auth/auth-rate-limit';
import {
  deletePrivateObject,
  isPrivateStorageConfigured,
  PrivateStorageError,
  storePrivatePaymentProof,
} from '@backend/order/private-object-storage.service';

export const runtime = 'nodejs';

const failure = (code: string, message: string, status: number) =>
  NextResponse.json({ status: { code, message }, data: null }, { status, headers: { 'Cache-Control': 'no-store' } });

export async function POST(request: Request, context: { params: Promise<{ paymentId: string }> }) {
  const { paymentId } = await context.params;
  if (!ObjectId.isValid(paymentId)) return failure('ORDB02001', 'Payment ID tidak valid.', 400);
  const ipLimit = await enforceAuthRateLimit(request, 'payment-proof');
  if (ipLimit) return ipLimit;

  const declaredLength = Number(request.headers.get('content-length') ?? 0);
  if (declaredLength > 5 * 1024 * 1024 + 128 * 1024) {
    return failure('ORDB02003', 'Ukuran gambar maksimal 5 MB.', 400);
  }
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return failure('ORDB02001', 'Form upload bukti tidak valid.', 400);
  }
  const orderNumber = form.get('orderNumber');
  const rawWhatsapp = form.get('whatsapp');
  const file = form.get('file');
  if (
    typeof orderNumber !== 'string' ||
    !/^JH-\d{8}-[A-F0-9]{6}$/.test(orderNumber) ||
    typeof rawWhatsapp !== 'string' ||
    !(file instanceof File) ||
    file.size < 1 ||
    file.size > 5 * 1024 * 1024 ||
    !['image/jpeg', 'image/png'].includes(file.type)
  ) {
    return failure('ORDB02003', 'Pilih gambar JPG atau PNG dengan ukuran maksimal 5 MB.', 400);
  }
  const whatsappDigits = rawWhatsapp.replace(/[\s()+-]/g, '');
  if (!/^\d{8,15}$/.test(whatsappDigits)) return failure('ORDB02001', 'Nomor WhatsApp tidak valid.', 400);
  const whatsapp = `+${whatsappDigits}`;
  const subjectLimit = await enforceAuthRateLimit(request, 'payment-proof', paymentId);
  if (subjectLimit) return subjectLimit;
  if (!isPrivateStorageConfigured()) {
    return failure('ORDT04001', 'Penyimpanan bukti pembayaran belum dikonfigurasi.', 503);
  }

  let uploadedKey = '';
  let proofId = '';
  let historyId = '';
  let paymentClaimed = false;
  try {
    const payment = await db.orm.order_payment.where({ _id: paymentId }).include('order').first();
    if (
      !payment ||
      payment.order.order_number !== orderNumber ||
      payment.order.customer_whatsapp !== whatsapp ||
      !payment.order.expires_at ||
      payment.order.expires_at <= new Date()
    ) {
      return failure('ORDB02002', 'Pesanan tidak ditemukan, tidak cocok, atau sudah kedaluwarsa.', 404);
    }
    if (payment.status === 'PENDING_REVIEW') {
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
      return failure('ORDB02004', 'Upload bukti pembayaran sedang diproses.', 409);
    }
    if (payment.status !== 'UNPAID') return failure('ORDB02002', 'Payment tidak dapat menerima bukti pembayaran.', 409);

    const image = await storePrivatePaymentProof(paymentId, new Uint8Array(await file.arrayBuffer()), file.type);
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
    await db.orm.customer_order
      .where({ _id: payment.order._id })
      .update({ payment_status: 'PENDING_REVIEW', updated_at: now });

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
    return NextResponse.json(
      {
        status: { code: 'ORDS00000', message: 'Bukti diterima dan menunggu pemeriksaan admin.' },
        data: { id: proofId, status: 'PENDING_REVIEW' },
      },
      { status: 201, headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
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
    if (paymentClaimed) {
      const payment = await db.orm.order_payment
        .where({ _id: paymentId })
        .first()
        .catch(() => null);
      if (payment) {
        await db.orm.order_payment
          .where({ _id: paymentId, status: 'PENDING_REVIEW' })
          .update({ status: 'UNPAID', submitted_at: null, updated_at: new Date() })
          .catch(() => undefined);
        await db.orm.customer_order
          .where({ _id: payment.order_id })
          .update({ payment_status: 'UNPAID', updated_at: new Date() })
          .catch(() => undefined);
      }
    }
    if (uploadedKey) await deletePrivateObject(uploadedKey).catch(() => undefined);
    if (error instanceof PrivateStorageError)
      return failure(error.code === 'INVALID_IMAGE' ? 'ORDB02003' : 'ORDT04001', error.message, error.status);
    return failure('ORDT03001', 'Bukti pembayaran tidak dapat disimpan saat ini.', 500);
  }
}
