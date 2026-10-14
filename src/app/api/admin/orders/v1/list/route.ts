import { NextResponse } from 'next/server';
import { requireAdminApi } from '@backend/shared/admin-auth';
import { listAdminOrders, toAdminOrderError } from '@backend/order/admin-order.service';

export async function GET(request: Request) {
  const denied = await requireAdminApi('ORDB01001', request);
  if (denied) return denied;
  const query = new URL(request.url).searchParams;
  const page = Number(query.get('page') ?? '1');
  const pageSize = Number(query.get('pageSize') ?? '20');
  const search = query.get('search') ?? '';
  const status = query.get('status') ?? '';
  if (
    [...query.keys()].some((key) => !['page', 'pageSize', 'search', 'status'].includes(key)) ||
    !Number.isInteger(page) ||
    page < 1 ||
    !Number.isInteger(pageSize) ||
    pageSize < 1 ||
    pageSize > 100 ||
    search.length > 100 ||
    status.length > 40
  ) {
    return NextResponse.json(
      { status: { code: 'ORDB02001', message: 'Filter pesanan tidak valid.' }, data: null },
      { status: 400 }
    );
  }
  try {
    return NextResponse.json({
      status: { code: 'ORDS00000', message: 'Daftar pesanan berhasil diambil.' },
      data: await listAdminOrders({ page, pageSize, search, status }),
    });
  } catch (error) {
    const failure = toAdminOrderError(error);
    return NextResponse.json(
      { status: { code: failure.code, message: failure.message }, data: null },
      { status: failure.status }
    );
  }
}
