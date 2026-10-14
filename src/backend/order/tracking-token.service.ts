import { createHash, randomBytes } from 'node:crypto';
import { ObjectId } from 'mongodb';
import { db } from '@prisma/db';

const TOKEN_TTL_MS = 15 * 60 * 1000;
const digest = (token: string) => createHash('sha256').update(token).digest('hex');

export async function issueOrderTrackingToken(orderId: string) {
  const now = new Date();
  const previous = await db.orm.order_tracking_token.where({ order_id: orderId }).all();
  const token = `trk_${randomBytes(32).toString('base64url')}`;
  const expiresAt = new Date(now.getTime() + TOKEN_TTL_MS);
  const tokenId = new ObjectId().toHexString();
  await db.orm.order_tracking_token.create({
    _id: tokenId,
    token_hash: digest(token),
    order_id: orderId,
    expires_at: expiresAt,
    revoked_at: null,
    created_at: now,
  });
  for (const previousToken of previous) {
    if (previousToken.revoked_at || previousToken.expires_at <= now) {
      await db.orm.order_tracking_token.where({ _id: previousToken._id }).delete();
    } else {
      await db.orm.order_tracking_token.where({ _id: previousToken._id }).update({ revoked_at: now });
    }
  }
  return { token, expiresAt: expiresAt.toISOString() };
}

export async function resolveOrderTrackingToken(token: string) {
  if (!/^trk_[A-Za-z0-9_-]{43}$/.test(token)) return null;
  const record = await db.orm.order_tracking_token.where({ token_hash: digest(token) }).first();
  if (!record || record.revoked_at || record.expires_at <= new Date()) return null;
  return { orderId: String(record.order_id) };
}
