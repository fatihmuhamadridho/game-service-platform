import { NextResponse } from 'next/server';
import { setCustomerSession } from '@backend/auth/customer-auth';
import { registerCustomer, toAuthenticationServiceError } from '@backend/auth/authentication.service';
import { createRefreshSession, setRefreshCookie } from '@backend/auth/refresh-session';
import { enforceAuthRateLimit } from '@backend/auth/auth-rate-limit';

export async function POST(request: Request) {
  const ipLimit = await enforceAuthRateLimit(request, 'register');
  if (ipLimit) return ipLimit;
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { status: { code: 'AUTB02001', message: 'Data pendaftaran tidak valid.' }, data: null },
      { status: 400 }
    );
  }
  const allowed = new Set(['name', 'username', 'email', 'whatsapp', 'password', 'termsAccepted']);
  const valid =
    Object.keys(body).every((key) => allowed.has(key)) &&
    typeof body.name === 'string' &&
    body.name.trim().length > 0 &&
    body.name.length <= 150 &&
    typeof body.username === 'string' &&
    /^[a-z0-9._-]{3,30}$/.test(body.username.trim().toLowerCase()) &&
    typeof body.email === 'string' &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email) &&
    body.email.length <= 254 &&
    (body.whatsapp === undefined || (typeof body.whatsapp === 'string' && /^\+[1-9]\d{7,14}$/.test(body.whatsapp))) &&
    typeof body.password === 'string' &&
    body.password.length >= 8 &&
    body.password.length <= 128 &&
    body.termsAccepted === true;
  if (!valid)
    return NextResponse.json(
      { status: { code: 'AUTB02001', message: 'Periksa kembali data pendaftaran.' }, data: null },
      { status: 400 }
    );
  const name = (body.name as string).trim();
  const username = (body.username as string).trim().toLowerCase();
  const email = (body.email as string).trim().toLowerCase();
  const subjectLimit = await enforceAuthRateLimit(request, 'register', email);
  if (subjectLimit) return subjectLimit;
  try {
    const registered = await registerCustomer({
      name,
      username,
      email,
      password: body.password as string,
      ...(typeof body.whatsapp === 'string' ? { whatsapp: body.whatsapp } : {}),
    });
    const response = NextResponse.json(
      {
        status: { code: 'AUTS00000', message: 'Akun berhasil dibuat.' },
        data: { user: registered.account, expiresIn: 900 },
      },
      { status: 201 }
    );
    const refreshToken = await createRefreshSession('CUSTOMER', registered.account.id);
    return setRefreshCookie(setCustomerSession(response, registered.accessToken), 'CUSTOMER', refreshToken);
  } catch (error) {
    const serviceError = toAuthenticationServiceError(error);
    return NextResponse.json(
      { status: { code: serviceError.code, message: serviceError.message }, data: null },
      { status: serviceError.status }
    );
  }
}
