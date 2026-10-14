import { createHmac } from 'node:crypto';
import { MongoClient } from 'mongodb';
import { NextResponse } from 'next/server';

type AuthRateLimitAction =
  'login' | 'register' | 'recovery' | 'checkout' | 'payment-proof' | 'payment-status' | 'order-tracking';
type BucketDocument = {
  bucket_key: string;
  request_count: number;
  expires_at: Date;
  created_at: Date;
};
type MongoRuntime = { client?: MongoClient; connected?: Promise<MongoClient> };

const globalRuntime = globalThis as typeof globalThis & { __jokihubAuthRateLimit?: MongoRuntime };
const runtime = (globalRuntime.__jokihubAuthRateLimit ??= {});
const config: Record<AuthRateLimitAction, { ipLimit: number; subjectLimit: number; windowMs: number }> = {
  login: { ipLimit: 100, subjectLimit: 10, windowMs: 15 * 60 * 1000 },
  register: { ipLimit: 20, subjectLimit: 3, windowMs: 60 * 60 * 1000 },
  recovery: { ipLimit: 20, subjectLimit: 5, windowMs: 60 * 60 * 1000 },
  checkout: { ipLimit: 40, subjectLimit: 10, windowMs: 15 * 60 * 1000 },
  'payment-proof': { ipLimit: 12, subjectLimit: 4, windowMs: 60 * 60 * 1000 },
  'payment-status': { ipLimit: 240, subjectLimit: 120, windowMs: 60 * 60 * 1000 },
  'order-tracking': { ipLimit: 50, subjectLimit: 10, windowMs: 60 * 60 * 1000 },
};

function getClientIp(request: Request) {
  const direct = request.headers.get('x-real-ip')?.trim();
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const value = direct || forwarded || 'unknown';
  return value.slice(0, 128).toLowerCase();
}

function digest(value: string) {
  const secret = process.env['JWT_SECRET'];
  if (!secret || secret.length < 32) throw new Error('JWT_SECRET must be configured with at least 32 characters.');
  return createHmac('sha256', secret).update(value).digest('hex');
}

async function getCollection() {
  const url = process.env['MONGODB_URL']?.trim();
  if (!url) throw new Error('MONGODB_URL is not configured.');
  if (!runtime.client) runtime.client = new MongoClient(url, { appName: 'jokihub-auth-rate-limit' });
  runtime.connected ??= runtime.client.connect();
  let client: MongoClient;
  try {
    client = await runtime.connected;
  } catch (error) {
    runtime.connected = undefined;
    runtime.client = undefined;
    throw error;
  }
  return client.db().collection<BucketDocument>('auth_rate_limit_bucket');
}

async function incrementBucket(action: AuthRateLimitAction, dimension: string, limit: number, windowMs: number) {
  const now = Date.now();
  const windowNumber = Math.floor(now / windowMs);
  const expiresAt = new Date((windowNumber + 1) * windowMs);
  const bucketKey = digest(`${action}:${windowNumber}:${dimension}`);
  const collection = await getCollection();

  try {
    await collection.updateOne(
      { bucket_key: bucketKey },
      { $inc: { request_count: 1 }, $setOnInsert: { created_at: new Date(now), expires_at: expiresAt } },
      { upsert: true }
    );
  } catch (error) {
    if (!error || typeof error !== 'object' || !('code' in error) || error.code !== 11000) throw error;
    await collection.updateOne({ bucket_key: bucketKey }, { $inc: { request_count: 1 } });
  }

  const bucket = await collection.findOne({ bucket_key: bucketKey });
  if (!bucket) throw new Error('Auth rate limit counter could not be read.');
  return {
    allowed: bucket.request_count <= limit,
    retryAfter: Math.max(1, Math.ceil((expiresAt.getTime() - now) / 1000)),
  };
}

function rateLimited(retryAfter: number) {
  return NextResponse.json(
    { status: { code: 'AUTB01002', message: 'Terlalu banyak percobaan. Coba lagi setelah jeda.' }, data: null },
    { status: 429, headers: { 'Retry-After': String(retryAfter), 'Cache-Control': 'no-store' } }
  );
}

export async function enforceAuthRateLimit(
  request: Request,
  action: AuthRateLimitAction,
  subject?: string
): Promise<NextResponse | null> {
  const { ipLimit, subjectLimit, windowMs } = config[action];
  try {
    const ipKey = digest(getClientIp(request));
    const result = subject
      ? await incrementBucket(
          action,
          `ip-subject:${ipKey}:${digest(subject.trim().toLowerCase())}`,
          subjectLimit,
          windowMs
        )
      : await incrementBucket(action, `ip:${ipKey}`, ipLimit, windowMs);
    return result.allowed ? null : rateLimited(result.retryAfter);
  } catch {
    return NextResponse.json(
      { status: { code: 'AUTT03001', message: 'Layanan autentikasi sedang tidak tersedia.' }, data: null },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
