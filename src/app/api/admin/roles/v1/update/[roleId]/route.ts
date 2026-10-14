import { NextResponse } from 'next/server';
import { requireAdminApi } from '@backend/shared/admin-auth';
import { parseRoleInput, toAdminRoleError, updateAdminRole } from '@backend/roles/admin-role.service';
export async function PUT(request: Request, { params }: { params: Promise<{ roleId: string }> }) {
  const denied = requireAdminApi('ROLB01001', request);
  if (denied) return denied;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { status: { code: 'ROLB02001', message: 'Data role tidak valid.' }, data: null },
      { status: 400 }
    );
  }
  const input = parseRoleInput(body, true);
  if (!input)
    return NextResponse.json(
      { status: { code: 'ROLB02001', message: 'Data role tidak valid.' }, data: null },
      { status: 400 }
    );
  try {
    const { roleId } = await params;
    return NextResponse.json({
      status: { code: 'ROLS00000', message: 'Role berhasil diperbarui.' },
      data: { role: await updateAdminRole(roleId, input, request) },
    });
  } catch (error) {
    const e = toAdminRoleError(error);
    return NextResponse.json({ status: { code: e.code, message: e.message }, data: null }, { status: e.status });
  }
}
