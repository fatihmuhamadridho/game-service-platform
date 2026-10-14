import { NextResponse } from 'next/server';
import { requireAdminApi } from '@backend/shared/admin-auth';
import { inviteAdminMember, parseAdminMemberInvitation, toAdminMemberError } from '@backend/user/admin-member.service';

export async function POST(request: Request) {
  const denied = requireAdminApi('USRB01001', request);
  if (denied) return denied;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { status: { code: 'USRB02001', message: 'Data user tidak valid.' }, data: null },
      { status: 400 }
    );
  }
  const invitation = parseAdminMemberInvitation(body);
  if (!invitation) {
    return NextResponse.json(
      { status: { code: 'USRB02001', message: 'Periksa nama, username, dan email member.' }, data: null },
      { status: 400 }
    );
  }

  try {
    await inviteAdminMember(invitation);
    return NextResponse.json(
      { status: { code: 'USRS00000', message: 'Undangan berhasil dibuat.' }, data: null },
      { status: 201 }
    );
  } catch (error) {
    const serviceError = toAdminMemberError(error);
    return NextResponse.json(
      { status: { code: serviceError.code, message: serviceError.message }, data: null },
      { status: serviceError.status }
    );
  }
}
