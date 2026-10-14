import { NextResponse } from 'next/server';
import { authenticateAccount } from '@backend/auth/authentication.service';
import { ADMIN_COOKIE } from '@backend/auth/admin-token';
import { createRefreshSession, setRefreshCookie } from '@backend/auth/refresh-session';
import { enforceAuthRateLimit } from '@backend/auth/auth-rate-limit';

type LoginBody = { identifier?: unknown; username?: unknown; email?: unknown; password?: unknown };

export async function POST(request: Request) {
  const ipLimit = await enforceAuthRateLimit(request, 'login');
  if (ipLimit) return ipLimit;
  let body: LoginBody;
  try {
    body = (await request.json()) as LoginBody;
  } catch {
    return NextResponse.json(
      { status: { code: 'ADMB02001', message: 'Username atau password tidak valid.' }, data: null },
      { status: 400 }
    );
  }
  const identifier =
    typeof body.identifier === 'string'
      ? body.identifier
      : typeof body.username === 'string'
        ? body.username
        : typeof body.email === 'string'
          ? body.email
          : '';
  if (
    typeof body.password !== 'string' ||
    identifier.length < 1 ||
    identifier.length > 254 ||
    body.password.length > 128 ||
    Object.keys(body).some((key) => !['identifier', 'username', 'email', 'password'].includes(key))
  ) {
    return NextResponse.json(
      { status: { code: 'ADMB02001', message: 'Username/email atau password tidak valid.' }, data: null },
      { status: 400 }
    );
  }
  const subjectLimit = await enforceAuthRateLimit(request, 'login', identifier);
  if (subjectLimit) return subjectLimit;
  try {
    const authenticated = await authenticateAccount(identifier, body.password, { adminOnly: true });
    if (!authenticated || authenticated.accountType !== 'ADMIN') {
      return NextResponse.json(
        { status: { code: 'ADMB01001', message: 'Kredensial admin tidak valid.' }, data: null },
        { status: 401 }
      );
    }
    const refreshToken = await createRefreshSession('ADMIN', authenticated.account.id);
    const response = NextResponse.json({
      status: { code: 'ADMS00000', message: 'Login admin berhasil.' },
      data: {
        tokenType: 'Bearer',
        expiresIn: 900,
        admin: { ...authenticated.account, role: authenticated.role },
      },
    });
    response.cookies.set(ADMIN_COOKIE, authenticated.accessToken, {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 900,
    });
    setRefreshCookie(response, 'ADMIN', refreshToken);
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch {
    return NextResponse.json(
      { status: { code: 'ADMT03001', message: 'Autentikasi admin sedang tidak tersedia.' }, data: null },
      { status: 500 }
    );
  }
}
