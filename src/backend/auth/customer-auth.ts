import { NextResponse } from 'next/server';
import { verifyCustomerAccessToken } from './customer-token';

export const CUSTOMER_COOKIE = '__Host-jokihub-session';

export async function getCustomerClaims(request: Request) {
  const token = request.headers.get('cookie')?.match(/(?:^|;\s*)__Host-jokihub-session=([^;]+)/)?.[1];
  return token ? verifyCustomerAccessToken(decodeURIComponent(token)) : null;
}

export function getCustomerTokens(request: Request) {
  const bearer = request.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1];
  const cookie = request.headers.get('cookie')?.match(/(?:^|;\s*)__Host-jokihub-session=([^;]+)/)?.[1];
  return [...new Set([bearer, cookie].filter((token): token is string => Boolean(token)))];
}

export function setCustomerSession(response: NextResponse, token: string) {
  response.cookies.set(CUSTOMER_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 900,
  });
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
