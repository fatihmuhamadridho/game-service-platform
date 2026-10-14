import { NextResponse } from 'next/server';
import { requireAdminApi } from '@backend/shared/admin-auth';
import { listAdminTransactions, toAdminTransactionError } from '@backend/transaction/admin-transaction.service';

export async function GET(request: Request) {
  const denied = requireAdminApi('TRXB01001', request);
  if (denied) return denied;
  const query = new URL(request.url).searchParams;
  const page = Number(query.get('page') ?? '1');
  const pageSize = Number(query.get('pageSize') ?? '20');
  const search = query.get('search') ?? '';
  const status = query.get('status') ?? '';
  const method = query.get('method') ?? '';
  const type = query.get('type') ?? '';
  if (
    [...query.keys()].some((key) => !['page', 'pageSize', 'search', 'status', 'method', 'type'].includes(key)) ||
    !Number.isInteger(page) ||
    page < 1 ||
    !Number.isInteger(pageSize) ||
    pageSize < 1 ||
    pageSize > 100 ||
    search.length > 100 ||
    status.length > 32 ||
    method.length > 40 ||
    type.length > 24
  ) {
    return NextResponse.json(
      { status: { code: 'TRNB02001', message: 'Filter transaksi tidak valid.' }, data: null },
      { status: 400 }
    );
  }
  try {
    const data = await listAdminTransactions({ search, status, method, type, page, pageSize });
    return NextResponse.json({ status: { code: 'TRNS00000', message: 'Daftar transaksi berhasil diambil.' }, data });
  } catch (error) {
    const failure = toAdminTransactionError(error);
    return NextResponse.json(
      { status: { code: failure.code, message: failure.message }, data: null },
      { status: failure.status }
    );
  }
}
