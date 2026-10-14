import jwt from 'jsonwebtoken';

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
  });
}

export function verifyCustomerAccessToken(token: string): CustomerTokenClaims | null {
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
