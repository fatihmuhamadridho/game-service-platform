import 'dotenv/config';
import { MongoClient } from 'mongodb';

const url = process.env['MONGODB_URL']?.trim();
if (!url) throw new Error('MONGODB_URL is not configured.');
const mongodbUrl: string = url;

async function main() {
  const client = new MongoClient(mongodbUrl, { appName: 'jokihub-auth-rate-limit-index-setup' });
  try {
    await client.connect();
    const collection = client.db().collection('auth_rate_limit_bucket');
    const name = await collection.createIndex({ expires_at: 1 }, { name: 'expires_at_ttl', expireAfterSeconds: 0 });
    process.stdout.write(`Auth rate-limit TTL index ready: ${name}\n`);
  } finally {
    await client.close();
  }
}

void main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : 'Could not create rate-limit TTL index.'}\n`);
  process.exitCode = 1;
});
