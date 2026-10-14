import { NextResponse, type NextRequest } from 'next/server';
import { verifyAdminAccessToken } from '@backend/auth/admin-token';
import { verifyCustomerAccessToken } from '@backend/auth/customer-token';
import { ADMIN_REFRESH_COOKIE, CUSTOMER_REFRESH_COOKIE } from '@backend/auth/session-cookies';

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (pathname === '/admin/login') return NextResponse.redirect(new URL('/login', request.url));
  if (pathname === '/login' || pathname === '/register') return NextResponse.next();
  if (pathname.startsWith('/account')) {
    const customerToken = request.cookies.get('__Host-jokihub-session')?.value;
    if (customerToken && (await verifyCustomerAccessToken(customerToken))) return NextResponse.next();
    if (request.cookies.get(CUSTOMER_REFRESH_COOKIE)?.value)
      return NextResponse.redirect(new URL('/login?refresh=customer', request.url));
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (!pathname.startsWith('/admin')) return NextResponse.next();
  const token = request.cookies.get('jokihub-admin')?.value;
  if (token && (await verifyAdminAccessToken(token))) return NextResponse.next();
  if (request.cookies.get(ADMIN_REFRESH_COOKIE)?.value)
    return NextResponse.redirect(new URL('/login?refresh=admin', request.url));
  return NextResponse.redirect(new URL('/login', request.url));
}

export const config = { matcher: ['/admin/:path*', '/account/:path*'] };
