import { NextResponse } from 'next/server';
import { requireAdminApi } from '@backend/shared/admin-auth';
import { createAdminRole, parseRoleInput, toAdminRoleError } from '@backend/roles/admin-role.service';
export async function POST(request: Request) {
  const denied = await requireAdminApi('ROLB01001', request);
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
  const input = parseRoleInput(body);
  if (!input || !('name' in input) || !('code' in input))
    return NextResponse.json(
      { status: { code: 'ROLB02001', message: 'Data role tidak valid.' }, data: null },
      { status: 400 }
    );
  try {
    const role = await createAdminRole(input as import('@backend/roles/admin-role.service').RoleInput, request);
    return NextResponse.json(
      { status: { code: 'ROLS00000', message: 'Role berhasil dibuat.' }, data: { role } },
      { status: 201 }
    );
  } catch (error) {
    const e = toAdminRoleError(error);
    return NextResponse.json({ status: { code: e.code, message: e.message }, data: null }, { status: e.status });
  }
}
