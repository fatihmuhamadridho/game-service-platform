import { NextResponse } from 'next/server';
import { requireAdminPermissions } from '@backend/shared/admin-auth';
import { getAdminAccount, toAdminAccountError } from '@backend/admin-accounts/admin-account.service';
export async function GET(request: Request, { params }: { params: Promise<{ adminId: string }> }) {
  const denied = requireAdminPermissions('USRB01001', request, ['settings-manage']);
  if (denied) return denied;
  try {
    const { adminId } = await params;
    return NextResponse.json({
      status: { code: 'USRS00000', message: 'Detail admin berhasil diambil.' },
      data: { admin: await getAdminAccount(adminId) },
    });
  } catch (error) {
    const e = toAdminAccountError(error);
    return NextResponse.json({ status: { code: e.code, message: e.message }, data: null }, { status: e.status });
  }
}
