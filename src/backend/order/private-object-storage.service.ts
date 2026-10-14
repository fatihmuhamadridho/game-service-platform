import { randomBytes } from 'node:crypto';
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import sharp from 'sharp';

const MAX_INPUT_BYTES = 5 * 1024 * 1024;
const MAX_IMAGE_PIXELS = 20_000_000;

export class PrivateStorageError extends Error {
  constructor(
    readonly code: 'STORAGE_NOT_CONFIGURED' | 'INVALID_IMAGE' | 'STORAGE_FAILED',
    message: string,
    readonly status: number
  ) {
    super(message);
  }
}

function readStorageConfig() {
  const endpoint = process.env['OBJECT_STORAGE_ENDPOINT']?.trim();
  const region = process.env['OBJECT_STORAGE_REGION']?.trim();
  const bucket = process.env['OBJECT_STORAGE_BUCKET']?.trim();
  const accessKeyId = process.env['OBJECT_STORAGE_ACCESS_KEY_ID']?.trim();
  const secretAccessKey = process.env['OBJECT_STORAGE_SECRET_ACCESS_KEY'];
  if (!endpoint || !region || !bucket || !accessKeyId || !secretAccessKey) {
    throw new PrivateStorageError('STORAGE_NOT_CONFIGURED', 'Upload bukti pembayaran belum tersedia.', 503);
  }
  try {
    const url = new URL(endpoint);
    if (!['https:', ...(process.env['NODE_ENV'] === 'production' ? [] : ['http:'])].includes(url.protocol)) {
      throw new Error('Invalid protocol');
    }
  } catch {
    throw new PrivateStorageError('STORAGE_NOT_CONFIGURED', 'Konfigurasi penyimpanan file tidak valid.', 503);
  }
  return {
    endpoint,
    region,
    bucket,
    accessKeyId,
    secretAccessKey,
    forcePathStyle: process.env['OBJECT_STORAGE_FORCE_PATH_STYLE'] !== 'false',
  };
}

export function isPrivateStorageConfigured() {
  try {
    readStorageConfig();
    return true;
  } catch {
    return false;
  }
}

function createClient() {
  const config = readStorageConfig();
  return {
    config,
    client: new S3Client({
      endpoint: config.endpoint,
      region: config.region,
      forcePathStyle: config.forcePathStyle,
      credentials: { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey },
    }),
  };
}

export async function storePrivatePaymentProof(paymentId: string, input: Uint8Array, mimeType: string) {
  if (input.byteLength === 0 || input.byteLength > MAX_INPUT_BYTES || !['image/jpeg', 'image/png'].includes(mimeType)) {
    throw new PrivateStorageError('INVALID_IMAGE', 'Pilih gambar JPG atau PNG dengan ukuran maksimal 5 MB.', 400);
  }

  let image: Buffer;
  try {
    const pipeline = sharp(input, { limitInputPixels: MAX_IMAGE_PIXELS, failOn: 'error' });
    const metadata = await pipeline.metadata();
    if (!['jpeg', 'png'].includes(metadata.format ?? '')) throw new Error('Unsupported image format');
    image = await pipeline.rotate().png({ compressionLevel: 9 }).toBuffer();
  } catch {
    throw new PrivateStorageError('INVALID_IMAGE', 'File bukan gambar JPG atau PNG yang valid.', 400);
  }

  const { client, config } = createClient();
  const objectKey = `payment-proofs/${paymentId}/${randomBytes(24).toString('hex')}.png`;
  try {
    await client.send(
      new PutObjectCommand({
        Bucket: config.bucket,
        Key: objectKey,
        Body: image,
        ContentType: 'image/png',
        ContentLength: image.byteLength,
        ServerSideEncryption: 'AES256',
        Metadata: { paymentid: paymentId },
      })
    );
    return { objectKey, mimeType: 'image/png' as const, fileSizeBytes: image.byteLength };
  } catch {
    throw new PrivateStorageError('STORAGE_FAILED', 'Penyimpanan bukti pembayaran sedang tidak tersedia.', 503);
  }
}

export async function deletePrivateObject(objectKey: string) {
  const { client, config } = createClient();
  await client.send(new DeleteObjectCommand({ Bucket: config.bucket, Key: objectKey }));
}

export async function createPrivateObjectViewUrl(objectKey: string) {
  const { client, config } = createClient();
  return getSignedUrl(
    client,
    new GetObjectCommand({
      Bucket: config.bucket,
      Key: objectKey,
      ResponseContentType: 'image/png',
      ResponseContentDisposition: 'inline',
    }),
    { expiresIn: 300 }
  );
}
