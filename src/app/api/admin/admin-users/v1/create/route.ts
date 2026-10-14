import { NextResponse } from 'next/server';
import { requireAdminPermissions } from '@backend/shared/admin-auth';
import { getAdminToken, verifyAdminAccessToken } from '@backend/auth/admin-token';
import { toAdminAccountError, validateAdminAccountInput } from '@backend/admin-accounts/admin-account.service';

export async function POST(request: Request) {
  const denied = await requireAdminPermissions('USRB01001', request, ['settings-manage']);
  if (denied) return denied;
  if ((await verifyAdminAccessToken(getAdminToken(request)))?.role !== 'SUPER_ADMIN')
    return NextResponse.json(
      { status: { code: 'USRB01002', message: 'Hanya Super Admin dapat membuat akun admin.' }, data: null },
      { status: 403 }
    );
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { status: { code: 'USRB02001', message: 'Data admin tidak valid.' }, data: null },
      { status: 400 }
    );
  }
  try {
    const input = await validateAdminAccountInput(body);
    if (!input)
      return NextResponse.json(
        { status: { code: 'USRB02001', message: 'Nama, username, email, dan role wajib valid.' }, data: null },
        { status: 400 }
      );
    return NextResponse.json(
      {
        status: {
          code: 'USRT02001',
          message: 'Undangan akun admin belum tersedia karena identity provider belum dikonfigurasi.',
        },
        data: null,
      },
      { status: 503 }
    );
  } catch (error) {
    const e = toAdminAccountError(error);
    return NextResponse.json({ status: { code: e.code, message: e.message }, data: null }, { status: e.status });
  }
}
