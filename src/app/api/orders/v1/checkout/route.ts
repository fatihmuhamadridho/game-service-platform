import { NextResponse } from 'next/server';
import { enforceAuthRateLimit } from '@backend/auth/auth-rate-limit';
import { CheckoutError, createCheckoutOrder } from '@backend/order/checkout.service';

type CheckoutBody = {
  gameSlug?: unknown;
  serviceId?: unknown;
  quantity?: unknown;
  paymentMethod?: unknown;
  customer?: { name?: unknown; whatsapp?: unknown };
  item?: { gameAccount?: unknown; gameServer?: unknown; customerNotes?: unknown };
};

const fail = (code: string, message: string, status: number) =>
  NextResponse.json({ status: { code, message }, data: null }, { status, headers: { 'Cache-Control': 'no-store' } });
const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

export async function POST(request: Request) {
  const ipLimit = await enforceAuthRateLimit(request, 'checkout');
  if (ipLimit) return ipLimit;

  let body: CheckoutBody;
  try {
    body = (await request.json()) as CheckoutBody;
  } catch {
    return fail('ORDB02001', 'Data pesanan tidak valid.', 400);
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return fail('ORDB02001', 'Data pesanan tidak valid.', 400);
  }
  const key = request.headers.get('Idempotency-Key')?.trim() ?? '';
  const gameSlug = text(body.gameSlug).toLowerCase();
  const serviceId = text(body.serviceId);
  const name = text(body.customer?.name);
  const rawWhatsapp = text(body.customer?.whatsapp).replace(/[\s()-]/g, '');
  const whatsapp = rawWhatsapp.startsWith('+') ? rawWhatsapp : `+${rawWhatsapp}`;
  const gameAccount = text(body.item?.gameAccount);
  const gameServer = body.item?.gameServer === null ? null : text(body.item?.gameServer) || null;
  const notes = body.item?.customerNotes === null ? null : text(body.item?.customerNotes) || null;
  const quantity = body.quantity;
  const paymentMethod = text(body.paymentMethod);
  const allowedKeys = new Set(['gameSlug', 'serviceId', 'quantity', 'paymentMethod', 'customer', 'item']);
  const extraKeys = Object.keys(body as Record<string, unknown>).some((field) => !allowedKeys.has(field));

  if (
    !key ||
    !/^[A-Za-z0-9._:-]{8,200}$/.test(key) ||
    extraKeys ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(gameSlug) ||
    !serviceId ||
    serviceId.length > 64 ||
    !Number.isInteger(quantity) ||
    Number(quantity) < 1 ||
    Number(quantity) > 100 ||
    !['QRIS', 'BCA_TRANSFER'].includes(paymentMethod) ||
    !name ||
    name.length > 150 ||
    !/^\+[1-9]\d{7,14}$/.test(whatsapp) ||
    !gameAccount ||
    gameAccount.length > 100 ||
    (gameServer && gameServer.length > 100) ||
    (notes && notes.length > 1000) ||
    /password|\bpass\b|otp|token|credential/i.test(`${gameAccount} ${notes ?? ''}`)
  ) {
    return fail('ORDB02001', 'Periksa kembali detail pesanan dan data kontak.', 400);
  }

  const subjectLimit = await enforceAuthRateLimit(request, 'checkout', whatsapp);
  if (subjectLimit) return subjectLimit;
  try {
    const data = await createCheckoutOrder({
      gameSlug,
      serviceId,
      quantity: Number(quantity),
      paymentMethod: paymentMethod as 'QRIS' | 'BCA_TRANSFER',
      customer: { name, whatsapp },
      item: { gameAccount, gameServer, customerNotes: notes },
      idempotencyKey: key,
    });
    return NextResponse.json(
      { status: { code: 'ORDS00000', message: 'Pesanan berhasil dibuat.' }, data },
      { status: data.idempotentReplay ? 200 : 201, headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    const failure =
      error instanceof CheckoutError
        ? error
        : new CheckoutError('ORDT03001', 'Layanan checkout sedang tidak tersedia.', 500);
    return fail(failure.code, failure.message, failure.status);
  }
}
