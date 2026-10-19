import { NextResponse } from 'next/server';
import { enforceAuthRateLimit } from '@backend/auth/auth-rate-limit';
import { resetCustomerPassword, toPasswordRecoveryError } from '@backend/auth/password-recovery.service';
import { FEATURE_PASSWORD_RECOVERY } from '@configs/base.config';

export async function POST(request: Request) {
  if (!FEATURE_PASSWORD_RECOVERY)
    return NextResponse.json(
      { status: { code: 'AUTT02004', message: 'Pemulihan password sedang dinonaktifkan.' }, data: null },
      { status: 404, headers: { 'Cache-Control': 'no-store' } }
    );

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { status: { code: 'AUTB02001', message: 'Data reset password tidak valid.' }, data: null },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    );
  }
  if (
    !body ||
    typeof body !== 'object' ||
    Array.isArray(body) ||
    Object.keys(body).some((key) => !['token', 'password'].includes(key)) ||
    typeof body.token !== 'string' ||
    !/^[A-Za-z0-9_-]{40,60}$/.test(body.token) ||
    typeof body.password !== 'string' ||
    body.password.length < 8 ||
    body.password.length > 128
  ) {
    return NextResponse.json(
      { status: { code: 'AUTB02001', message: 'Password harus terdiri dari 8–128 karakter.' }, data: null },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    );
  }
  const subjectLimit = await enforceAuthRateLimit(request, 'recovery', body.token);
  if (subjectLimit) return subjectLimit;

  try {
    await resetCustomerPassword(body.token, body.password);
    return NextResponse.json(
      { status: { code: 'AUTS00000', message: 'Password berhasil diubah. Silakan masuk kembali.' }, data: null },
      { status: 200, headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    const serviceError = toPasswordRecoveryError(error);
    return NextResponse.json(
      { status: { code: serviceError.code, message: serviceError.message }, data: null },
      { status: serviceError.status, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
