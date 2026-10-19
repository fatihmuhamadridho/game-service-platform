import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';
import { db } from '@prisma/db';
import { getPrivatePaymentProof, PrivateStorageError } from '@backend/order/private-object-storage.service';
import { requireAdminApi } from '@backend/shared/admin-auth';
import { FEATURE_SPRINT_2 } from '@configs/base.config';

export const runtime = 'nodejs';

const failure = (code: string, message: string, status: number) =>
  NextResponse.json({ status: { code, message }, data: null }, { status, headers: { 'Cache-Control': 'no-store' } });

export async function GET(request: Request, context: { params: Promise<{ proofId: string }> }) {
  if (!FEATURE_SPRINT_2) return failure('ORDT04004', 'Fitur bukti pembayaran sedang dinonaktifkan.', 404);
  const denied = await requireAdminApi('ORDB01001', request);
  if (denied) return denied;

  const { proofId } = await context.params;
  if (!ObjectId.isValid(proofId)) return failure('ORDB02001', 'ID bukti pembayaran tidak valid.', 400);
  try {
    const proof = await db.orm.payment_proof.where({ _id: proofId }).first();
    if (!proof) return failure('ORDB02002', 'Bukti pembayaran tidak ditemukan.', 404);
    const blob = await getPrivatePaymentProof(proof.object_key);
    if (!blob) return failure('ORDB02002', 'Gambar bukti pembayaran tidak ditemukan.', 404);
    return new Response(blob.stream, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': 'inline; filename="payment-proof.png"',
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
        'Content-Security-Policy': "default-src 'none'; sandbox",
      },
    });
  } catch (error) {
    if (error instanceof PrivateStorageError) {
      return failure('ORDT04001', error.message, error.status);
    }
    return failure('ORDT03001', 'Gambar bukti pembayaran sementara tidak tersedia.', 500);
  }
}
