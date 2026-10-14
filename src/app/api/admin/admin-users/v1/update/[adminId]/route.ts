import { NextResponse } from 'next/server';
import { requireAdminPermissions } from '@backend/shared/admin-auth';
import { getAdminToken, verifyAdminAccessToken } from '@backend/auth/admin-token';
import { toAdminAccountError, updateAdminAccount } from '@backend/admin-accounts/admin-account.service';
export async function PATCH(request: Request, { params }: { params: Promise<{ adminId: string }> }) {
  const denied = await requireAdminPermissions('USRB01001', request, ['settings-manage']);
  if (denied) return denied;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { status: { code: 'USRB02001', message: 'Data admin tidak valid.' }, data: null },
      { status: 400 }
    );
  }
  if (
    body &&
    typeof body === 'object' &&
    'roleIds' in body &&
    (await verifyAdminAccessToken(getAdminToken(request)))?.role !== 'SUPER_ADMIN'
  )
    return NextResponse.json(
      { status: { code: 'USRB01002', message: 'Hanya Super Admin dapat mengubah assignment role.' }, data: null },
      { status: 403 }
    );
  try {
    const { adminId } = await params;
    return NextResponse.json({
      status: { code: 'USRS00000', message: 'Admin berhasil diperbarui.' },
      data: { admin: await updateAdminAccount(adminId, body, request) },
    });
  } catch (error) {
    const e = toAdminAccountError(error);
    return NextResponse.json({ status: { code: e.code, message: e.message }, data: null }, { status: e.status });
  }
}
