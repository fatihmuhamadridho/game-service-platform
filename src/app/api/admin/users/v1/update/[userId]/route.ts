import { NextResponse } from 'next/server';
import { requireAdminApi } from '@backend/shared/admin-auth';
import { getAdminToken, verifyAdminAccessToken } from '@backend/auth/admin-token';
import { parseAdminMemberUpdate, toAdminMemberError, updateAdminMember } from '@backend/user/admin-member.service';

export async function PATCH(request: Request, context: { params: Promise<{ userId: string }> }) {
  const denied = requireAdminApi('USRB01001', request);
  if (denied) return denied;
  const { userId } = await context.params;
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { status: { code: 'USRB02001', message: 'Data user tidak valid.' }, data: null },
      { status: 400 }
    );
  }
  const input = parseAdminMemberUpdate(body);
  if (!input) {
    return NextResponse.json(
      { status: { code: 'USRB02001', message: 'Data user tidak valid.' }, data: null },
      { status: 400 }
    );
  }
  try {
    const token = getAdminToken(request);
    const actor = token ? verifyAdminAccessToken(token) : null;
    const user = await updateAdminMember(userId, input, actor?.sub ?? null);
    return NextResponse.json({
      status: { code: 'USRS00000', message: 'User berhasil diperbarui.' },
      data: { user },
    });
  } catch (error) {
    const serviceError = toAdminMemberError(error);
    return NextResponse.json(
      { status: { code: serviceError.code, message: serviceError.message }, data: null },
      { status: serviceError.status }
    );
  }
}
