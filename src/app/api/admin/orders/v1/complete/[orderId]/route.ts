import { NextResponse } from 'next/server';
import { getAdminToken, verifyAdminAccessToken } from '@backend/auth/admin-token';
import { AdminOrderError, completeAdminOrder, toAdminOrderError } from '@backend/order/admin-order.service';
import { requireAdminApi } from '@backend/shared/admin-auth';

export async function POST(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  const denied = await requireAdminApi('ORDB01001', request);
  if (denied) return denied;
  const actor = await verifyAdminAccessToken(getAdminToken(request));
  if (!actor) {
    return NextResponse.json(
      { status: { code: 'ORDB01001', message: 'Sesi administrator tidak tersedia.' }, data: null },
      { status: 401 }
    );
  }
  try {
    const { orderId } = await params;
    const data = await completeAdminOrder({ orderId, adminId: actor.sub });
    return NextResponse.json({ status: { code: 'ORDS00000', message: 'Pesanan ditandai selesai.' }, data });
  } catch (error) {
    const failure = error instanceof AdminOrderError ? error : toAdminOrderError(error);
    return NextResponse.json(
      { status: { code: failure.code, message: failure.message }, data: null },
      { status: failure.status }
    );
  }
}
