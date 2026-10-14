import { createHash, randomBytes } from 'node:crypto';
import { hash } from 'bcryptjs';
import { MongoClient, ObjectId } from 'mongodb';
import { db } from '@prisma/db';
import { isEmailDeliveryConfigured, sendEmail } from '@backend/notifications/email-delivery.service';
import { revokeCustomerRefreshSessions } from './refresh-session';

const TOKEN_LIFETIME_MS = 30 * 60 * 1000;
let mongoClient: MongoClient | undefined;
let mongoConnection: Promise<MongoClient> | undefined;

export class PasswordRecoveryError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status: number
  ) {
    super(message);
  }
}

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

async function consumeActionToken(tokenId: string, now: Date) {
  const url = process.env['MONGODB_URL']?.trim();
  if (!url) throw new Error('MONGODB_URL is not configured.');
  mongoClient ??= new MongoClient(url, { appName: 'jokihub-password-recovery' });
  mongoConnection ??= mongoClient.connect();
  try {
    const connected = await mongoConnection;
    const result = await connected
      .db()
      .collection('auth_action_token')
      .updateOne(
        { _id: new ObjectId(tokenId), token_type: 'PASSWORD_RESET', used_at: null, expires_at: { $gt: now } },
        { $set: { used_at: now } }
      );
    return result.modifiedCount === 1;
  } catch (error) {
    mongoClient = undefined;
    mongoConnection = undefined;
    throw error;
  }
}

function readBaseUrl() {
  const value = process.env['APP_BASE_URL']?.trim();
  if (!value) throw new PasswordRecoveryError('AUTT02004', 'Pemulihan password belum dikonfigurasi.', 503);
  try {
    const url = new URL(value);
    if (
      !['http:', 'https:'].includes(url.protocol) ||
      (process.env['NODE_ENV'] === 'production' && url.protocol !== 'https:')
    ) {
      throw new Error('Invalid protocol');
    }
    return url.origin;
  } catch {
    throw new PasswordRecoveryError('AUTT02004', 'Pemulihan password belum dikonfigurasi.', 503);
  }
}

export function isPasswordRecoveryConfigured() {
  try {
    return isEmailDeliveryConfigured() && Boolean(readBaseUrl());
  } catch {
    return false;
  }
}

export async function requestPasswordReset(email: string) {
  const user = await db.orm.user_account.where({ email }).first();
  if (!user || user.deleted_at || user.status !== 'ACTIVE') return;

  const token = randomBytes(32).toString('base64url');
  const now = new Date();
  const tokenId = new ObjectId().toHexString();
  const oldTokens = await db.orm.auth_action_token
    .where({ account_id: String(user._id), token_type: 'PASSWORD_RESET' })
    .all();
  await Promise.all(
    oldTokens.map((entry) =>
      entry.expires_at <= now
        ? db.orm.auth_action_token.where({ _id: entry._id }).delete()
        : !entry.used_at
          ? db.orm.auth_action_token.where({ _id: entry._id }).update({ used_at: now })
          : Promise.resolve()
    )
  );
  await db.orm.auth_action_token.create({
    _id: tokenId,
    token_hash: hashToken(token),
    token_type: 'PASSWORD_RESET',
    account_id: String(user._id),
    expires_at: new Date(now.getTime() + TOKEN_LIFETIME_MS),
    created_at: now,
    used_at: null,
  });

  try {
    const resetUrl = `${readBaseUrl()}/reset-password?token=${encodeURIComponent(token)}`;
    await sendEmail({
      to: user.email,
      subject: 'Atur ulang password JokiHub',
      text: `Gunakan tautan ini dalam 30 menit untuk mengatur ulang password: ${resetUrl}\nJika kamu tidak meminta reset, abaikan email ini.`,
      html: `<p>Gunakan tautan ini dalam 30 menit untuk mengatur ulang password:</p><p><a href="${resetUrl}">Atur ulang password</a></p><p>Jika kamu tidak meminta reset, abaikan email ini.</p>`,
    });
  } catch {
    await db.orm.auth_action_token.where({ _id: tokenId }).update({ used_at: new Date() });
    // Keep the same public response for registered and unregistered emails.
  }
}

export async function resetCustomerPassword(token: string, password: string) {
  const tokenRecord = await db.orm.auth_action_token
    .where({ token_hash: hashToken(token), token_type: 'PASSWORD_RESET' })
    .first();
  const now = new Date();
  if (!tokenRecord || tokenRecord.used_at || tokenRecord.expires_at <= now) {
    throw new PasswordRecoveryError('AUTB02005', 'Tautan reset tidak valid atau sudah kedaluwarsa.', 400);
  }

  const user = await db.orm.user_account.where({ _id: String(tokenRecord.account_id), status: 'ACTIVE' }).first();
  if (!user || user.deleted_at) {
    throw new PasswordRecoveryError('AUTB02005', 'Tautan reset tidak valid atau sudah kedaluwarsa.', 400);
  }

  if (!(await consumeActionToken(String(tokenRecord._id), now))) {
    throw new PasswordRecoveryError('AUTB02005', 'Tautan reset tidak valid atau sudah kedaluwarsa.', 400);
  }

  const passwordHash = await hash(password, 12);
  await revokeCustomerRefreshSessions(String(user._id), now);
  await db.orm.user_account.where({ _id: user._id }).update({
    password_hash: passwordHash,
    updated_at: now,
  });
  const activeTokens = (
    await db.orm.auth_action_token.where({ account_id: user._id, token_type: 'PASSWORD_RESET' }).all()
  ).filter((entry) => !entry.used_at);
  await Promise.all(
    activeTokens.map((entry) => db.orm.auth_action_token.where({ _id: entry._id }).update({ used_at: now }))
  );
}

export function toPasswordRecoveryError(error: unknown) {
  if (error instanceof PasswordRecoveryError) return error;
  return new PasswordRecoveryError('AUTT03001', 'Layanan pemulihan password sedang tidak tersedia.', 500);
}
