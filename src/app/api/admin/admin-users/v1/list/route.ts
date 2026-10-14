import { NextResponse } from 'next/server';
import { requireAdminPermissions } from '@backend/shared/admin-auth';
import { listAdminAccounts, toAdminAccountError } from '@backend/admin-accounts/admin-account.service';
export async function GET(request: Request) {
  const denied = requireAdminPermissions('USRB01001', request, ['settings-manage']);
  if (denied) return denied;
  const query = new URL(request.url).searchParams;
  const page = Number(query.get('page') ?? '1');
  const pageSize = Number(query.get('pageSize') ?? '20');
  const search = query.get('search') ?? '';
  const status = query.get('status') ?? '';
  const roleId = query.get('roleId') ?? '';
  if (
    [...query.keys()].some((key) => !['page', 'pageSize', 'search', 'status', 'roleId'].includes(key)) ||
    !Number.isInteger(page) ||
    page < 1 ||
    !Number.isInteger(pageSize) ||
    pageSize < 1 ||
    pageSize > 100 ||
    search.length > 100 ||
    !['', 'ACTIVE', 'INACTIVE'].includes(status)
  )
    return NextResponse.json(
      { status: { code: 'USRB02001', message: 'Filter admin tidak valid.' }, data: null },
      { status: 400 }
    );
  try {
    return NextResponse.json({
      status: { code: 'USRS00000', message: 'Daftar admin berhasil diambil.' },
      data: await listAdminAccounts({ search, status, roleId, page, pageSize }),
    });
  } catch (error) {
    const e = toAdminAccountError(error);
    return NextResponse.json({ status: { code: e.code, message: e.message }, data: null }, { status: e.status });
  }
}
