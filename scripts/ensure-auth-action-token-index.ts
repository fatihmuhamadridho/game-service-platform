import 'dotenv/config';
import { MongoClient } from 'mongodb';

const url = process.env['MONGODB_URL']?.trim();
if (!url) throw new Error('MONGODB_URL is not configured.');
const mongodbUrl: string = url;

async function main() {
  const client = new MongoClient(mongodbUrl, { appName: 'jokihub-auth-action-token-index-setup' });
  try {
    await client.connect();
    const collection = client.db().collection('auth_action_token');
    const indexes = await collection.listIndexes().toArray();
    const existing = indexes.find((index) => index.key.expires_at === 1 && Object.keys(index.key).length === 1);
    if (existing && existing.expireAfterSeconds !== undefined) await collection.dropIndex(existing.name);
    const name = await collection.createIndex({ expires_at: 1 }, { name: 'expires_at_1' });
    process.stdout.write(`Auth action-token index ready: ${name}\n`);
  } finally {
    await client.close();
  }
}

void main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : 'Could not create auth action-token index.'}\n`);
  process.exitCode = 1;
});
