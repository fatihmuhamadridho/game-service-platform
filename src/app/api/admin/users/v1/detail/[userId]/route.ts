import { NextResponse } from 'next/server';
import { requireAdminApi } from '@backend/shared/admin-auth';
import { getAdminMember, toAdminMemberError } from '@backend/user/admin-member.service';

export async function GET(request: Request, context: { params: Promise<{ userId: string }> }) {
  const denied = await requireAdminApi('USRB01001', request);
  if (denied) return denied;
  const { userId } = await context.params;
  try {
    return NextResponse.json({
      status: { code: 'USRS00000', message: 'Detail user berhasil diambil.' },
      data: { user: await getAdminMember(userId) },
    });
  } catch (error) {
    const serviceError = toAdminMemberError(error);
    return NextResponse.json(
      { status: { code: serviceError.code, message: serviceError.message }, data: null },
      { status: serviceError.status }
    );
  }
}
