import { NextResponse } from 'next/server';
import { requireAdminApi } from '@backend/shared/admin-auth';
import { listAdminRoles, toAdminRoleError } from '@backend/roles/admin-role.service';
export async function GET(request: Request) {
  const denied = requireAdminApi('ROLB01001', request);
  if (denied) return denied;
  try {
    return NextResponse.json({
      status: { code: 'ROLS00000', message: 'Daftar role berhasil diambil.' },
      data: await listAdminRoles(),
    });
  } catch (error) {
    const e = toAdminRoleError(error);
    return NextResponse.json({ status: { code: e.code, message: e.message }, data: null }, { status: e.status });
  }
}
