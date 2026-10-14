import { createHash } from 'node:crypto';
import { MongoClient } from 'mongodb';

const collectionName = 'auth_revoked_access_token';
let clientPromise: Promise<MongoClient> | undefined;

function getClient() {
  const url = process.env['MONGODB_URL']?.trim();
  if (!url) throw new Error('MONGODB_URL is not configured.');
  if (!clientPromise) {
    const client = new MongoClient(url, { appName: 'jokihub-access-token-revocation' });
    clientPromise = client.connect().catch((error: unknown) => {
      clientPromise = undefined;
      throw error;
    });
  }
  return clientPromise;
}

function keyFor(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

export async function isAccessTokenRevoked(token: string, jti?: string) {
  const client = await getClient();
  const key = keyFor(jti || token);
  return Boolean(
    await client
      .db()
      .collection<{ _id: string; expires_at: Date; revoked_at: Date }>(collectionName)
      .findOne({ _id: key }, { projection: { _id: 1 } })
  );
}

export async function revokeAccessToken(token: string, jti: string | undefined, expiresAt: Date) {
  if (expiresAt <= new Date()) return;
  const client = await getClient();
  const key = keyFor(jti || token);
  await client
    .db()
    .collection<{ _id: string; expires_at: Date; revoked_at: Date }>(collectionName)
    .updateOne({ _id: key }, { $setOnInsert: { expires_at: expiresAt, revoked_at: new Date() } }, { upsert: true });
}
