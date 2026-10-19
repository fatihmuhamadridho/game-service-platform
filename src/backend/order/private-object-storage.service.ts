import { randomBytes } from 'node:crypto';
import { del, get, put } from '@vercel/blob';
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

export function isPrivateStorageConfigured() {
  return Boolean(process.env['BLOB_READ_WRITE_TOKEN']?.trim());
}

export function isPaymentProofUploadPath(paymentId: string, pathname: string) {
  return new RegExp(`^payment-proofs/${paymentId}/[a-f0-9-]{36}\\.(?:jpg|jpeg|png)$`, 'i').test(pathname);
}

export async function storePrivatePaymentProof(paymentId: string, uploadedPathname: string) {
  if (!isPrivateStorageConfigured()) {
    throw new PrivateStorageError('STORAGE_NOT_CONFIGURED', 'Upload bukti pembayaran belum tersedia.', 503);
  }
  if (!isPaymentProofUploadPath(paymentId, uploadedPathname)) {
    throw new PrivateStorageError('INVALID_IMAGE', 'Path unggahan bukti pembayaran tidak valid.', 400);
  }

  let storedPathname = '';
  try {
    const uploaded = await get(uploadedPathname, { access: 'private' });
    if (!uploaded) throw new PrivateStorageError('INVALID_IMAGE', 'File unggahan tidak ditemukan.', 400);
    if (uploaded.blob.size === null || uploaded.blob.size < 1 || uploaded.blob.size > MAX_INPUT_BYTES) {
      throw new PrivateStorageError('INVALID_IMAGE', 'Ukuran gambar maksimal 5 MB.', 400);
    }

    const input = Buffer.from(await new Response(uploaded.stream).arrayBuffer());
    if (input.byteLength < 1 || input.byteLength > MAX_INPUT_BYTES) {
      throw new PrivateStorageError('INVALID_IMAGE', 'Ukuran gambar maksimal 5 MB.', 400);
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

    const pathname = `payment-proofs/${paymentId}/${randomBytes(24).toString('hex')}.png`;
    const stored = await put(pathname, image, {
      access: 'private',
      addRandomSuffix: false,
      contentType: 'image/png',
      cacheControlMaxAge: 60,
    });
    storedPathname = stored.pathname;
    await del(uploadedPathname);
    return { objectKey: stored.pathname, mimeType: 'image/png' as const, fileSizeBytes: image.byteLength };
  } catch (error) {
    if (storedPathname) await del(storedPathname).catch(() => undefined);
    await del(uploadedPathname).catch(() => undefined);
    if (error instanceof PrivateStorageError) throw error;
    throw new PrivateStorageError('STORAGE_FAILED', 'Penyimpanan bukti pembayaran sedang tidak tersedia.', 503);
  }
}

export async function deletePrivateObject(objectKey: string) {
  await del(objectKey);
}

export async function getPrivatePaymentProof(objectKey: string) {
  if (!isPrivateStorageConfigured()) {
    throw new PrivateStorageError('STORAGE_NOT_CONFIGURED', 'Penyimpanan bukti pembayaran belum tersedia.', 503);
  }
  return get(objectKey, { access: 'private' });
}
