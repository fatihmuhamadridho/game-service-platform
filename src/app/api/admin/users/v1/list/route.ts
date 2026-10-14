import { NextResponse } from 'next/server';
import { requireAdminApi } from '@backend/shared/admin-auth';
import { listAdminMembers, toAdminMemberError } from '@backend/user/admin-member.service';

export async function GET(request: Request) {
  const denied = requireAdminApi('USRB01001', request);
  if (denied) return denied;
  const params = new URL(request.url).searchParams;
  const page = Number(params.get('page') ?? '1');
  const pageSize = Number(params.get('pageSize') ?? '20');
  const search = (params.get('search') ?? '').trim().toLowerCase();
  const status = params.get('status') ?? '';
  if (
    !Number.isInteger(page) ||
    page < 1 ||
    !Number.isInteger(pageSize) ||
    pageSize < 1 ||
    pageSize > 100 ||
    !['', 'ACTIVE', 'BLOCKED'].includes(status) ||
    search.length > 100 ||
    [...params.keys()].some((key) => !['page', 'pageSize', 'search', 'status'].includes(key))
  ) {
    return NextResponse.json(
      { status: { code: 'USRB02001', message: 'Parameter pencarian atau pagination tidak valid.' }, data: null },
      { status: 400 }
    );
  }
  try {
    const result = await listAdminMembers({ page, pageSize, search, status: status as '' | 'ACTIVE' | 'BLOCKED' });
    return NextResponse.json({
      status: { code: 'USRS00000', message: 'Daftar user berhasil diambil.' },
      data: result,
    });
  } catch (error) {
    const serviceError = toAdminMemberError(error);
    return NextResponse.json(
      { status: { code: serviceError.code, message: serviceError.message }, data: null },
      { status: serviceError.status }
    );
  }
}
