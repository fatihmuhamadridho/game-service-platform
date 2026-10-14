import { NextResponse } from 'next/server';
import { getAdminToken, verifyAdminAccessToken } from '@backend/auth/admin-token';
import { reviewOrderPayment, toAdminOrderError } from '@backend/order/admin-order.service';
import { requireAdminApi } from '@backend/shared/admin-auth';

export async function POST(request: Request) {
  const denied = requireAdminApi('ORDB01001', request);
  if (denied) return denied;
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { status: { code: 'ORDB02001', message: 'Data pemeriksaan tidak valid.' }, data: null },
      { status: 400 }
    );
  }
  if (
    !body ||
    typeof body !== 'object' ||
    Array.isArray(body) ||
    Object.keys(body).some((key) => !['orderId', 'paymentId', 'decision', 'note'].includes(key)) ||
    typeof body.orderId !== 'string' ||
    typeof body.paymentId !== 'string' ||
    !['APPROVE', 'REJECT'].includes(String(body.decision)) ||
    (body.note !== undefined && body.note !== null && typeof body.note !== 'string') ||
    (typeof body.note === 'string' && body.note.trim().length > 500)
  ) {
    return NextResponse.json(
      { status: { code: 'ORDB02001', message: 'Data pemeriksaan tidak valid.' }, data: null },
      { status: 400 }
    );
  }
  const actor = verifyAdminAccessToken(getAdminToken(request));
  if (!actor)
    return NextResponse.json(
      { status: { code: 'ORDB01001', message: 'Sesi administrator tidak tersedia.' }, data: null },
      { status: 401 }
    );
  try {
    const result = await reviewOrderPayment({
      orderId: body.orderId,
      paymentId: body.paymentId,
      decision: body.decision as 'APPROVE' | 'REJECT',
      note: typeof body.note === 'string' && body.note.trim() ? body.note.trim() : null,
      adminId: actor.sub,
    });
    return NextResponse.json({
      status: { code: 'ORDS00000', message: 'Pemeriksaan pembayaran berhasil disimpan.' },
      data: result,
    });
  } catch (error) {
    const failure = toAdminOrderError(error);
    return NextResponse.json(
      { status: { code: failure.code, message: failure.message }, data: null },
      { status: failure.status }
    );
  }
}
