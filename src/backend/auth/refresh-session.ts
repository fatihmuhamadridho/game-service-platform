import { createHash, randomBytes } from 'node:crypto';
import { ObjectId } from 'mongodb';
import { db } from '@prisma/db';
import { createAdminAccessToken } from './admin-token';
import { resolveAdminAuthorization } from './admin-authorization';
import { createCustomerAccessToken } from './customer-token';
import { ADMIN_REFRESH_COOKIE, CUSTOMER_REFRESH_COOKIE } from './session-cookies';

export type RefreshAccountType = 'CUSTOMER' | 'ADMIN';
const REFRESH_LIFETIME_SECONDS = 60 * 60 * 24 * 7;

type RefreshCookieOptions = { httpOnly: true; secure: boolean; sameSite: 'lax' | 'strict'; path: '/'; maxAge: number };

function tokenHash(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

function readCookie(request: Request, name: string) {
  const value = request.headers.get('cookie')?.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`))?.[1];
  if (!value) return null;
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}

function refreshCookieOptions(type: RefreshAccountType, maxAge: number): RefreshCookieOptions {
  return {
    httpOnly: true,
    secure: type === 'CUSTOMER' || process.env['NODE_ENV'] === 'production',
    sameSite: type === 'CUSTOMER' ? 'lax' : 'strict',
    path: '/',
    maxAge,
  };
}

function refreshCookieHintName(type: RefreshAccountType) {
  return type === 'CUSTOMER' ? 'jokihub-customer-refresh-present' : 'jokihub-admin-refresh-present';
}

export function setRefreshCookie(
  response: import('next/server').NextResponse,
  type: RefreshAccountType,
  token: string
) {
  response.cookies.set(
    type === 'CUSTOMER' ? CUSTOMER_REFRESH_COOKIE : ADMIN_REFRESH_COOKIE,
    token,
    refreshCookieOptions(type, REFRESH_LIFETIME_SECONDS)
  );
  response.cookies.set(refreshCookieHintName(type), '1', {
    httpOnly: false,
    secure: type === 'CUSTOMER' || process.env['NODE_ENV'] === 'production',
    sameSite: type === 'CUSTOMER' ? 'lax' : 'strict',
    path: '/',
    maxAge: REFRESH_LIFETIME_SECONDS,
  });
  response.headers.set('Cache-Control', 'no-store');
  return response;
}

export function clearRefreshCookie(response: import('next/server').NextResponse, type: RefreshAccountType) {
  response.cookies.set(
    type === 'CUSTOMER' ? CUSTOMER_REFRESH_COOKIE : ADMIN_REFRESH_COOKIE,
    '',
    refreshCookieOptions(type, 0)
  );
  response.cookies.set(refreshCookieHintName(type), '', {
    httpOnly: false,
    secure: type === 'CUSTOMER' || process.env['NODE_ENV'] === 'production',
    sameSite: type === 'CUSTOMER' ? 'lax' : 'strict',
    path: '/',
    maxAge: 0,
  });
  response.headers.set('Cache-Control', 'no-store');
  return response;
}

export async function createRefreshSession(type: RefreshAccountType, accountId: string) {
  const token = randomBytes(32).toString('base64url');
  const now = new Date();
  await db.orm.auth_refresh_session.create({
    _id: new ObjectId().toHexString(),
    token_hash: tokenHash(token),
    account_type: type,
    account_id: accountId,
    family_id: new ObjectId().toHexString(),
    expires_at: new Date(now.getTime() + REFRESH_LIFETIME_SECONDS * 1000),
    created_at: now,
    is_revoked: false,
    last_used_at: null,
  });
  return token;
}

async function revokeSessionFamily(type: RefreshAccountType, accountId: string, familyId: string, now = new Date()) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const sessions = (
      await db.orm.auth_refresh_session.where({ account_type: type, account_id: accountId, family_id: familyId }).all()
    ).filter((session) => !session.is_revoked);
    if (sessions.length === 0) return;
    await Promise.all(
      sessions.map((session) =>
        db.orm.auth_refresh_session
          .where({ _id: session._id, is_revoked: false })
          .updateAndCount({ is_revoked: true, revoked_at: now })
      )
    );
  }
}

async function revokeAccountSessions(type: RefreshAccountType, accountId: string, now = new Date()) {
  const sessions = (
    await db.orm.auth_refresh_session.where({ account_type: type, account_id: accountId }).all()
  ).filter((session) => !session.is_revoked);
  await Promise.all(
    sessions.map((session) =>
      db.orm.auth_refresh_session.where({ _id: session._id }).update({ is_revoked: true, revoked_at: now })
    )
  );
}

export async function revokeCustomerRefreshSessions(accountId: string, now = new Date()) {
  await revokeAccountSessions('CUSTOMER', accountId, now);
}

export async function revokeRefreshSession(request: Request, type: RefreshAccountType) {
  const cookieName = type === 'CUSTOMER' ? CUSTOMER_REFRESH_COOKIE : ADMIN_REFRESH_COOKIE;
  const token = readCookie(request, cookieName);
  if (!token) return;
  const session = await db.orm.auth_refresh_session.where({ token_hash: tokenHash(token), account_type: type }).first();
  if (session) {
    await revokeSessionFamily(type, String(session.account_id), String(session.family_id));
  }
}

export async function rotateRefreshSession(request: Request, type: RefreshAccountType) {
  const cookieName = type === 'CUSTOMER' ? CUSTOMER_REFRESH_COOKIE : ADMIN_REFRESH_COOKIE;
  const token = readCookie(request, cookieName);
  if (!token) return null;
  const session = await db.orm.auth_refresh_session.where({ token_hash: tokenHash(token), account_type: type }).first();
  if (!session) return null;
  if (session.is_revoked) {
    await revokeAccountSessions(type, String(session.account_id));
    return null;
  }
  const now = new Date();
  if (session.expires_at <= now) {
    await db.orm.auth_refresh_session.where({ _id: session._id }).update({ is_revoked: true, revoked_at: now });
    return null;
  }

  let accessToken: string;
  if (type === 'CUSTOMER') {
    const user = await db.orm.user_account.where({ _id: String(session.account_id), status: 'ACTIVE' }).first();
    if (!user || user.deleted_at) {
      await revokeSessionFamily(type, String(session.account_id), String(session.family_id), now);
      return null;
    }
    accessToken = createCustomerAccessToken({ sub: String(user._id), username: user.username, role: 'CUSTOMER' });
  } else {
    const admin = await db.orm.admin_account.where({ _id: String(session.account_id), status: 'ACTIVE' }).first();
    const authorization = admin && !admin.deleted_at ? await resolveAdminAuthorization(String(admin._id)) : null;
    if (!admin || admin.deleted_at || !authorization) {
      await revokeSessionFamily(type, String(session.account_id), String(session.family_id), now);
      return null;
    }
    accessToken = createAdminAccessToken({ sub: String(admin._id), username: admin.username, ...authorization });
  }

  const nextToken = randomBytes(32).toString('base64url');
  const nextId = new ObjectId().toHexString();
  await db.orm.auth_refresh_session.create({
    _id: nextId,
    token_hash: tokenHash(nextToken),
    account_type: type,
    account_id: session.account_id,
    family_id: session.family_id,
    expires_at: new Date(now.getTime() + REFRESH_LIFETIME_SECONDS * 1000),
    created_at: now,
    is_revoked: false,
    last_used_at: null,
  });
  const consumed = await db.orm.auth_refresh_session
    .where({ _id: session._id, is_revoked: false })
    .updateAndCount({ is_revoked: true, revoked_at: now, last_used_at: now, replaced_by_id: nextId });
  if (consumed !== 1) {
    await db.orm.auth_refresh_session.where({ _id: nextId }).update({ is_revoked: true, revoked_at: now });
    await revokeAccountSessions(type, String(session.account_id), now);
    return null;
  }
  return { accessToken, refreshToken: nextToken };
}
