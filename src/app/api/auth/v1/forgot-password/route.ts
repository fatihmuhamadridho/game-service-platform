import { NextResponse } from 'next/server';
import { enforceAuthRateLimit } from '@backend/auth/auth-rate-limit';
import { isPasswordRecoveryConfigured, requestPasswordReset } from '@backend/auth/password-recovery.service';

export async function POST(request: Request) {
  const ipLimit = await enforceAuthRateLimit(request, 'recovery');
  if (ipLimit) return ipLimit;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { status: { code: 'AUTB02001', message: 'Data pemulihan tidak valid.' }, data: null },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    );
  }
  if (
    !body ||
    typeof body !== 'object' ||
    Array.isArray(body) ||
    Object.keys(body).some((key) => key !== 'email') ||
    typeof body.email !== 'string' ||
    body.email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())
  ) {
    return NextResponse.json(
      { status: { code: 'AUTB02001', message: 'Masukkan alamat email yang valid.' }, data: null },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    );
  }
  const email = body.email.trim().toLowerCase();
  const subjectLimit = await enforceAuthRateLimit(request, 'recovery', email);
  if (subjectLimit) return subjectLimit;
  if (!isPasswordRecoveryConfigured()) {
    return NextResponse.json(
      {
        status: { code: 'AUTT02004', message: 'Pemulihan password belum tersedia karena email belum dikonfigurasi.' },
        data: null,
      },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  try {
    await requestPasswordReset(email);
    return NextResponse.json(
      {
        status: { code: 'AUTS00000', message: 'Jika email terdaftar, instruksi pemulihan akan dikirim.' },
        data: null,
      },
      { status: 202, headers: { 'Cache-Control': 'no-store' } }
    );
  } catch {
    return NextResponse.json(
      { status: { code: 'AUTT03001', message: 'Layanan pemulihan password sedang tidak tersedia.' }, data: null },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
