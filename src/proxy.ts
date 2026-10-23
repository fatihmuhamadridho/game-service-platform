import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (pathname === '/admin/login') return NextResponse.redirect(new URL('/login', request.url));
  if (pathname === '/login' || pathname === '/register') return NextResponse.next();
  if (pathname.startsWith('/account')) {
    if (request.cookies.has('__Host-jokihub-session')) return NextResponse.next();
    if (request.cookies.has('__Host-jokihub-refresh'))
      return NextResponse.redirect(new URL('/login?refresh=customer', request.url));
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (!pathname.startsWith('/admin')) return NextResponse.next();
  if (request.cookies.has('jokihub-admin')) return NextResponse.next();
  if (request.cookies.has('jokihub-admin-refresh'))
    return NextResponse.redirect(new URL('/login?refresh=admin', request.url));
  return NextResponse.redirect(new URL('/login', request.url));
}

export const config = { matcher: ['/admin/:path*', '/account/:path*'] };
