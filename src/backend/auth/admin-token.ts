import jwt from 'jsonwebtoken';

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
  });
}

export function verifyAdminAccessToken(token: string): AdminTokenClaims | null {
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

export function getAdminToken(request: Request) {
  const bearer = request.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (bearer) return bearer;
  return request.headers.get('cookie')?.match(/(?:^|;\s*)jokihub-admin=([^;]+)/)?.[1] ?? '';
}
