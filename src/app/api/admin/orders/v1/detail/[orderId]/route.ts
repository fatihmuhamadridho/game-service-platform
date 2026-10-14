import { NextResponse } from 'next/server';
import { requireAdminApi } from '@backend/shared/admin-auth';
import { getAdminOrder, toAdminOrderError } from '@backend/order/admin-order.service';

export async function GET(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  const denied = await requireAdminApi('ORDB01001', request);
  if (denied) return denied;
  try {
    const { orderId } = await params;
    const order = await getAdminOrder(orderId);
    return NextResponse.json({
      status: { code: 'ORDS00000', message: 'Detail pesanan berhasil diambil.' },
      data: { order },
    });
  } catch (error) {
    const failure = toAdminOrderError(error);
    return NextResponse.json(
      { status: { code: failure.code, message: failure.message }, data: null },
      { status: failure.status }
    );
  }
}
