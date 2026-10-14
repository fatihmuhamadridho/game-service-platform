import { NextResponse } from 'next/server';
import { requireAdminApi } from '@backend/shared/admin-auth';
import { deleteAdminMember, toAdminMemberError } from '@backend/user/admin-member.service';

export async function DELETE(request: Request, context: { params: Promise<{ userId: string }> }) {
  const denied = await requireAdminApi('USRB01001', request);
  if (denied) return denied;
  const { userId } = await context.params;
  try {
    const result = await deleteAdminMember(userId);
    return NextResponse.json({
      status: { code: 'USRS00000', message: 'User berhasil dihapus.' },
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
