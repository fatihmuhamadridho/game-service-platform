import { NextResponse } from 'next/server';
import { ADMIN_COOKIE } from '@backend/auth/admin-token';
import { clearRefreshCookie, rotateRefreshSession, setRefreshCookie } from '@backend/auth/refresh-session';

export async function POST(request: Request) {
  try {
    const rotated = await rotateRefreshSession(request, 'ADMIN');
    if (!rotated) {
      const response = NextResponse.json(
        { status: { code: 'ADMB01001', message: 'Sesi admin tidak tersedia atau sudah berakhir.' }, data: null },
        { status: 401, headers: { 'Cache-Control': 'no-store' } }
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
    const response = NextResponse.json(
      {
        status: { code: 'ADMS00000', message: 'Sesi admin diperbarui.' },
        data: { accountType: 'ADMIN', expiresIn: 900 },
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
    response.cookies.set(ADMIN_COOKIE, rotated.accessToken, {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 900,
    });
    return setRefreshCookie(response, 'ADMIN', rotated.refreshToken);
  } catch {
    return NextResponse.json(
      { status: { code: 'ADMT03001', message: 'Autentikasi admin sedang tidak tersedia.' }, data: null },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
