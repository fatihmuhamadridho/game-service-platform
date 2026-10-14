import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import { isAccessTokenRevoked, revokeAccessToken } from './access-token-revocation';

export const ADMIN_COOKIE = 'jokihub-admin';

export type AdminTokenClaims = jwt.JwtPayload & {
  sub: string;
  username: string;
  role: 'SUPER_ADMIN' | 'ADMIN';
  permissions: string[];
};

const getSecret = () => {
  const secret = process.env['JWT_SECRET'];
  if (!secret || secret.length < 32) throw new Error('JWT_SECRET must be configured with at least 32 characters.');
  return secret;
};

export function createAdminAccessToken(claims: Omit<AdminTokenClaims, 'iat' | 'exp'>) {
  return jwt.sign(claims, getSecret(), {
    algorithm: 'HS256',
    expiresIn: '15m',
    issuer: 'jokihub-api',
    audience: 'jokihub-admin',
    jwtid: randomUUID(),
  });
}

function verifyAdminTokenSignature(token: string): AdminTokenClaims | null {
  try {
    const claims = jwt.verify(token, getSecret(), {
      algorithms: ['HS256'],
      issuer: 'jokihub-api',
      audience: 'jokihub-admin',
    });
    if (
      typeof claims === 'string' ||
      !['SUPER_ADMIN', 'ADMIN'].includes(claims.role) ||
      typeof claims.sub !== 'string' ||
      typeof claims.username !== 'string' ||
      !Array.isArray(claims.permissions) ||
      claims.permissions.some((permission) => typeof permission !== 'string')
    )
      return null;
    return claims as AdminTokenClaims;
  } catch {
    return null;
  }
}

export async function verifyAdminAccessToken(token: string): Promise<AdminTokenClaims | null> {
  const claims = verifyAdminTokenSignature(token);
  if (!claims) return null;
  try {
    return (await isAccessTokenRevoked(token, claims.jti)) ? null : claims;
  } catch {
    return null;
  }
}

export async function revokeAdminAccessToken(token: string) {
  const claims = verifyAdminTokenSignature(token);
  if (!claims || typeof claims.exp !== 'number') return false;
  await revokeAccessToken(token, claims.jti, new Date(claims.exp * 1000));
  return true;
}

export function getAdminToken(request: Request) {
  const bearer = request.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (bearer) return bearer;
  return request.headers.get('cookie')?.match(/(?:^|;\s*)jokihub-admin=([^;]+)/)?.[1] ?? '';
}

export function getAdminTokens(request: Request) {
  const bearer = request.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1];
  const cookie = request.headers.get('cookie')?.match(/(?:^|;\s*)jokihub-admin=([^;]+)/)?.[1];
  return [...new Set([bearer, cookie].filter((token): token is string => Boolean(token)))];
}
