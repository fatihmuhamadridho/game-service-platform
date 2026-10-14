import { NextResponse } from 'next/server';
import { CUSTOMER_COOKIE } from '@backend/auth/customer-auth';
import { clearRefreshCookie, revokeRefreshSession } from '@backend/auth/refresh-session';

export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json(
      { status: { code: 'AUTB02001', message: 'Permintaan logout tidak valid.' }, data: null },
      { status: 400 }
    );
  }
  try {
    await revokeRefreshSession(request, 'CUSTOMER');
  } catch {
    const response = NextResponse.json(
      { status: { code: 'AUTT03001', message: 'Logout sementara tidak tersedia.' }, data: null },
      { status: 500 }
    );
    response.cookies.set(CUSTOMER_COOKIE, '', { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 0 });
    return clearRefreshCookie(response, 'CUSTOMER');
  }
  const response = NextResponse.json({
    status: { code: 'AUTS00000', message: 'Logout diproses.' },
    data: { loggedOut: true },
  });
  response.cookies.set(CUSTOMER_COOKIE, '', { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 0 });
  return clearRefreshCookie(response, 'CUSTOMER');
}
