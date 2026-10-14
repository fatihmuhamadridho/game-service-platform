import { NextResponse } from 'next/server';
import { setCustomerSession } from '@backend/auth/customer-auth';
import { rotateRefreshSession, setRefreshCookie } from '@backend/auth/refresh-session';

export async function POST(request: Request) {
  try {
    const rotated = await rotateRefreshSession(request, 'CUSTOMER');
    if (!rotated) {
      return NextResponse.json(
        { status: { code: 'AUTB01001', message: 'Sesi tidak tersedia atau sudah berakhir.' }, data: null },
        { status: 401, headers: { 'Cache-Control': 'no-store' } }
      );
    }
    const response = NextResponse.json(
      { status: { code: 'AUTS00000', message: 'Sesi diperbarui.' }, data: { accountType: 'CUSTOMER', expiresIn: 900 } },
      { headers: { 'Cache-Control': 'no-store' } }
    );
    return setRefreshCookie(setCustomerSession(response, rotated.accessToken), 'CUSTOMER', rotated.refreshToken);
  } catch {
    return NextResponse.json(
      { status: { code: 'AUTT03001', message: 'Layanan autentikasi sedang tidak tersedia.' }, data: null },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
