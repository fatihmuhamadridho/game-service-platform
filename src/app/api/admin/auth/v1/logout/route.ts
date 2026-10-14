import { NextResponse } from 'next/server';
import { ADMIN_COOKIE } from '@backend/auth/admin-token';
import { clearRefreshCookie, revokeRefreshSession } from '@backend/auth/refresh-session';

export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin)
    return NextResponse.json(
      { status: { code: 'ADMB02001', message: 'Permintaan logout tidak valid.' }, data: null },
      { status: 400 }
    );
  try {
    await revokeRefreshSession(request, 'ADMIN');
  } catch {
    const response = NextResponse.json(
      { status: { code: 'ADMT03001', message: 'Logout admin sementara tidak tersedia.' }, data: null },
      { status: 500 }
    );
    response.cookies.set(ADMIN_COOKIE, '', {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 0,
    });
    return clearRefreshCookie(response, 'ADMIN');
  }
  const response = NextResponse.json({
    status: { code: 'ADMS00000', message: 'Logout admin berhasil.' },
    data: { loggedOut: true },
  });
  response.cookies.set(ADMIN_COOKIE, '', {
    httpOnly: true,
    secure: process.env['NODE_ENV'] === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  });
  return clearRefreshCookie(response, 'ADMIN');
}
