import { NextResponse } from 'next/server';
import { requireAdminApi } from '@backend/shared/admin-auth';
import { getAdminRole, toAdminRoleError } from '@backend/roles/admin-role.service';
export async function GET(request: Request, { params }: { params: Promise<{ roleId: string }> }) {
  const denied = requireAdminApi('ROLB01001', request);
  if (denied) return denied;
  try {
    const { roleId } = await params;
    return NextResponse.json({
      status: { code: 'ROLS00000', message: 'Role berhasil diambil.' },
      data: { role: await getAdminRole(roleId) },
    });
  } catch (error) {
    const e = toAdminRoleError(error);
    return NextResponse.json({ status: { code: e.code, message: e.message }, data: null }, { status: e.status });
  }
}
