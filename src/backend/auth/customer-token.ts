import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import { isAccessTokenRevoked, revokeAccessToken } from './access-token-revocation';

export type CustomerTokenClaims = jwt.JwtPayload & {
  sub: string;
  username: string;
  role: 'CUSTOMER';
};

function getSecret() {
  const secret = process.env['JWT_SECRET'];
  if (!secret || secret.length < 32) throw new Error('JWT_SECRET must contain at least 32 characters.');
  return secret;
}

export function createCustomerAccessToken(claims: Omit<CustomerTokenClaims, 'iat' | 'exp'>) {
  return jwt.sign(claims, getSecret(), {
    algorithm: 'HS256',
    expiresIn: '15m',
    issuer: 'jokihub-api',
    audience: 'jokihub-customer',
    jwtid: randomUUID(),
  });
}

function verifyCustomerTokenSignature(token: string): CustomerTokenClaims | null {
  try {
    const claims = jwt.verify(token, getSecret(), {
      algorithms: ['HS256'],
      issuer: 'jokihub-api',
      audience: 'jokihub-customer',
    });
    if (
      typeof claims === 'string' ||
      claims.role !== 'CUSTOMER' ||
      typeof claims.sub !== 'string' ||
      typeof claims.username !== 'string'
    )
      return null;
    return claims as CustomerTokenClaims;
  } catch {
    return null;
  }
}

export async function verifyCustomerAccessToken(token: string): Promise<CustomerTokenClaims | null> {
  const claims = verifyCustomerTokenSignature(token);
  if (!claims) return null;
  try {
    return (await isAccessTokenRevoked(token, claims.jti)) ? null : claims;
  } catch {
    return null;
  }
}

export async function revokeCustomerAccessToken(token: string) {
  const claims = verifyCustomerTokenSignature(token);
  if (!claims || typeof claims.exp !== 'number') return false;
  await revokeAccessToken(token, claims.jti, new Date(claims.exp * 1000));
  return true;
}
