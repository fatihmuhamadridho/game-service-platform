import { NextResponse } from 'next/server';
import { authenticateAccount } from '@backend/auth/authentication.service';
import { setCustomerSession } from '@backend/auth/customer-auth';
import { ADMIN_COOKIE } from '@backend/auth/admin-token';
import { createRefreshSession, setRefreshCookie } from '@backend/auth/refresh-session';
import { enforceAuthRateLimit } from '@backend/auth/auth-rate-limit';

export async function POST(request: Request) {
  const ipLimit = await enforceAuthRateLimit(request, 'login');
  if (ipLimit) return ipLimit;
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { status: { code: 'AUTB02001', message: 'Data masuk tidak valid.' }, data: null },
      { status: 400 }
    );
  }
  const allowed = new Set(['identifier', 'username', 'email', 'password']);
  const identifier = [body.identifier, body.username, body.email].find((value) => typeof value === 'string');
  if (
    Object.keys(body).some((key) => !allowed.has(key)) ||
    typeof body.password !== 'string' ||
    !body.password ||
    typeof identifier !== 'string' ||
    !identifier.trim() ||
    identifier.length > 254 ||
    body.password.length > 128
  ) {
    return NextResponse.json(
      { status: { code: 'AUTB02001', message: 'Username/email dan password wajib diisi.' }, data: null },
      { status: 400 }
    );
  }
  const subjectLimit = await enforceAuthRateLimit(request, 'login', identifier);
  if (subjectLimit) return subjectLimit;
  try {
    const authenticated = await authenticateAccount(identifier, body.password as string);
    if (!authenticated)
      return NextResponse.json(
        { status: { code: 'AUTB01001', message: 'Kredensial tidak valid.' }, data: null },
        { status: 401 }
      );
    if (authenticated.accountType === 'CUSTOMER') {
      const refreshToken = await createRefreshSession('CUSTOMER', authenticated.account.id);
      const response = NextResponse.json({
        status: { code: 'AUTS00000', message: 'Login berhasil.' },
        data: {
          accountType: 'CUSTOMER',
          user: authenticated.account,
          expiresIn: 900,
        },
      });
      return setRefreshCookie(setCustomerSession(response, authenticated.accessToken), 'CUSTOMER', refreshToken);
    }
    const refreshToken = await createRefreshSession('ADMIN', authenticated.account.id);
    const response = NextResponse.json({
      status: { code: 'AUTS00000', message: 'Login berhasil.' },
      data: {
        accountType: 'ADMIN',
        role: authenticated.role,
        user: authenticated.account,
        expiresIn: 900,
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
      { status: { code: 'AUTT03001', message: 'Layanan autentikasi sedang tidak tersedia.' }, data: null },
      { status: 500 }
    );
  }
}
