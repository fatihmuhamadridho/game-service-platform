import { createHash, randomBytes } from 'node:crypto';
import { ObjectId } from 'mongodb';
import { db } from '@prisma/db';
import { FEATURE_SPRINT_2 } from '@configs/base.config';

export type CheckoutPaymentMethod = 'QRIS' | 'BCA_TRANSFER';

type CheckoutInput = {
  gameSlug: string;
  serviceId: string;
  quantity: number;
  paymentMethod: CheckoutPaymentMethod;
  customer: { name: string; whatsapp: string };
  item: { gameAccount: string; gameServer: string | null; customerNotes: string | null };
  idempotencyKey: string;
};

type CheckoutResponse = {
  order: {
    id: string;
    orderNumber: string;
    orderStatus: string;
    paymentStatus: string;
    totalAmount: number;
    currency: string;
    expiresAt: string;
    game: { name: string };
    service: { id: string; name: string };
    quantity: number;
  };
  payment: {
    id: string;
    method: string;
    status: string;
    amount: number;
    instructions: {
      qrImageUrl: string | null;
      bankName: string | null;
      accountNumber: string | null;
      accountHolder: string | null;
      reference: string | null;
    };
  };
  nextAction: string;
  idempotentReplay: boolean;
};

export class CheckoutError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status: number
  ) {
    super(message);
  }
}

export async function reportPaymentAsPaid(input: { paymentId: string; orderNumber: string; whatsapp: string }) {
  const payment = await db.orm.order_payment.where({ _id: input.paymentId }).include('order').first();
  if (
    !payment ||
    payment.order.order_number !== input.orderNumber ||
    payment.order.customer_whatsapp !== input.whatsapp
  ) {
    throw new CheckoutError('ORDB02002', 'Pesanan tidak dapat diverifikasi.', 404);
  }
  if (!payment.order.expires_at || payment.order.expires_at <= new Date()) {
    throw new CheckoutError('ORDB02004', 'Batas pembayaran pesanan sudah berakhir.', 409);
  }
  if (payment.status !== 'UNPAID') {
    if (payment.status === 'PENDING_REVIEW') {
      if (!FEATURE_SPRINT_2) return { paymentStatus: payment.status };
      const proofs = await db.orm.payment_proof.where({ payment_id: input.paymentId }).all();
      if (proofs.length) return { paymentStatus: payment.status };
    }
    throw new CheckoutError('ORDB02004', 'Status pembayaran pesanan tidak dapat diubah.', 409);
  }
  if (FEATURE_SPRINT_2) {
    const proofs = await db.orm.payment_proof.where({ payment_id: input.paymentId }).all();
    if (!proofs.some((proof) => proof.uploaded_at > payment.updated_at)) {
      throw new CheckoutError('ORDB02004', 'Unggah bukti pembayaran terbaru sebelum mengonfirmasi pembayaran.', 409);
    }
  }

  const now = new Date();
  const changed = await db.orm.order_payment
    .where({ _id: input.paymentId, status: 'UNPAID' })
    .updateAndCount({ status: 'PENDING_REVIEW', submitted_at: now, updated_at: now });
  if (changed !== 1)
    throw new CheckoutError('ORDB02004', 'Status pembayaran sedang diperbarui. Muat ulang pesanan.', 409);

  const paymentHistoryId = new ObjectId().toHexString();
  const orderHistoryId = new ObjectId().toHexString();
  try {
    await db.orm.customer_order.where({ _id: String(payment.order_id) }).update({
      payment_status: 'PENDING_REVIEW',
      order_status: 'PENDING_VALIDATION',
      updated_at: now,
    });
    await db.orm.payment_status_history.create({
      _id: paymentHistoryId,
      payment_id: input.paymentId,
      old_status: 'UNPAID',
      new_status: 'PENDING_REVIEW',
      changed_by: null,
      reason: 'Pelanggan mengonfirmasi pembayaran; menunggu validasi admin.',
      changed_at: now,
    });
    await db.orm.order_status_history.create({
      _id: orderHistoryId,
      order_id: String(payment.order_id),
      old_status: payment.order.order_status,
      new_status: 'PENDING_VALIDATION',
      changed_by: null,
      reason: 'Pelanggan melaporkan pembayaran; menunggu validasi admin.',
      changed_at: now,
    });
  } catch {
    await db.orm.payment_status_history
      .where({ _id: paymentHistoryId })
      .delete()
      .catch(() => undefined);
    await db.orm.order_status_history
      .where({ _id: orderHistoryId })
      .delete()
      .catch(() => undefined);
    await db.orm.customer_order
      .where({ _id: String(payment.order_id) })
      .update({
        payment_status: payment.order.payment_status,
        order_status: payment.order.order_status,
        updated_at: new Date(),
      })
      .catch(() => undefined);
    await db.orm.order_payment
      .where({ _id: input.paymentId, status: 'PENDING_REVIEW' })
      .update({ status: 'UNPAID', submitted_at: null, updated_at: new Date() })
      .catch(() => undefined);
    throw new CheckoutError('ORDT03001', 'Konfirmasi pembayaran tidak dapat disimpan.', 500);
  }
  return { paymentStatus: 'PENDING_REVIEW' };
}

function digest(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

export function getPaymentInstructions(method: CheckoutPaymentMethod) {
  if (method === 'QRIS') {
    const qrImageUrl = process.env['PAYMENT_QRIS_IMAGE_URL']?.trim();
    if (!qrImageUrl) return null;
    try {
      const url = new URL(qrImageUrl);
      if (!['https:', ...(process.env['NODE_ENV'] === 'production' ? [] : ['http:'])].includes(url.protocol))
        return null;
    } catch {
      return null;
    }
    return { qrImageUrl, bankName: null, accountNumber: null, accountHolder: null };
  }

  const bankName = process.env['PAYMENT_BCA_BANK_NAME']?.trim();
  const accountNumber = process.env['PAYMENT_BCA_ACCOUNT_NUMBER']?.replace(/\s/g, '');
  const accountHolder = process.env['PAYMENT_BCA_ACCOUNT_HOLDER']?.trim();
  if (!bankName || !accountNumber || !accountHolder || !/^\d{5,30}$/.test(accountNumber)) return null;
  return { qrImageUrl: null, bankName, accountNumber, accountHolder };
}

function toMinorUnits(value: string) {
  const normalized = value.trim();
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) {
    throw new CheckoutError('ORDT03001', 'Harga layanan tidak dapat diproses.', 500);
  }
  const [whole, fraction = ''] = normalized.split('.');
  const hundred = BigInt('100');
  return BigInt(whole!) * hundred + BigInt(fraction.padEnd(2, '0'));
}

function fromMinorUnits(value: bigint) {
  const hundred = BigInt('100');
  return `${value / hundred}.${String(value % hundred).padStart(2, '0')}`;
}

async function getOrReserveIdempotency(input: CheckoutInput, requestHash: string) {
  const keyHash = digest(input.idempotencyKey);
  const now = new Date();
  const existing = await db.orm.checkout_idempotency.where({ key_hash: keyHash }).first();
  if (existing && existing.expires_at <= now) {
    await db.orm.checkout_idempotency.where({ _id: existing._id }).delete();
  } else if (existing) {
    if (existing.request_hash !== requestHash) {
      throw new CheckoutError('ORDB02005', 'Idempotency key sudah digunakan untuk data pesanan berbeda.', 409);
    }
    if (!existing.response_json) {
      throw new CheckoutError('ORDB02005', 'Pesanan dengan kunci ini sedang diproses. Coba lagi sebentar.', 409);
    }
    return { recordId: String(existing._id), replay: existing.response_json as CheckoutResponse };
  }

  const recordId = new ObjectId().toHexString();
  try {
    await db.orm.checkout_idempotency.create({
      _id: recordId,
      key_hash: keyHash,
      request_hash: requestHash,
      response_json: null,
      created_at: now,
      expires_at: new Date(now.getTime() + 24 * 60 * 60 * 1000),
    });
    return { recordId, replay: null };
  } catch {
    const raced = await db.orm.checkout_idempotency.where({ key_hash: keyHash }).first();
    if (raced?.request_hash === requestHash && raced.response_json) {
      return { recordId: String(raced._id), replay: raced.response_json as CheckoutResponse };
    }
    if (raced?.request_hash !== requestHash) {
      throw new CheckoutError('ORDB02005', 'Idempotency key sudah digunakan untuk data pesanan berbeda.', 409);
    }
    throw new CheckoutError('ORDB02005', 'Pesanan dengan kunci ini sedang diproses. Coba lagi sebentar.', 409);
  }
}

export async function createCheckoutOrder(input: CheckoutInput): Promise<CheckoutResponse> {
  const instructions = getPaymentInstructions(input.paymentMethod);
  if (!instructions) {
    throw new CheckoutError('ORDB02004', 'Instruksi metode pembayaran belum dikonfigurasi.', 503);
  }

  const settings = await db.orm.platform_settings.where({ singleton_key: 'current' }).first();
  if (!settings || settings.maintenance_mode || settings.default_currency !== 'IDR') {
    throw new CheckoutError('ORDT03001', 'Checkout belum tersedia untuk konfigurasi saat ini.', 503);
  }

  const requestHash = digest(
    JSON.stringify({
      gameSlug: input.gameSlug,
      serviceId: input.serviceId,
      quantity: input.quantity,
      paymentMethod: input.paymentMethod,
      customer: input.customer,
      item: input.item,
    })
  );
  const idempotency = await getOrReserveIdempotency(input, requestHash);
  if (idempotency.replay) return { ...idempotency.replay, idempotentReplay: true };

  const now = new Date();
  let createdOrderId = '';
  let createdPaymentId = '';
  let createdItemId = '';
  const createdHistoryIds: string[] = [];
  try {
    const game = await db.orm.game_catalog.where({ slug: input.gameSlug, is_active: true }).first();
    if (!game || game.deleted_at) throw new CheckoutError('ORDB02002', 'Game tidak tersedia.', 400);
    const services = await db.orm.game_service.where({ game_id: game._id, is_active: true }).include('category').all();
    const service = services.find((row) => String(row._id) === input.serviceId && !row.deleted_at);
    if (!service || !service.category.is_active || service.category.deleted_at) {
      throw new CheckoutError('ORDB02003', 'Layanan tidak tersedia untuk game ini.', 400);
    }
    if (service.is_custom_price || service.price_amount === null) {
      throw new CheckoutError('ORDB02003', 'Layanan ini memerlukan persetujuan harga sebelum checkout.', 400);
    }

    const unitMinor = toMinorUnits(service.price_amount.toString());
    const totalMinor = unitMinor * BigInt(input.quantity);
    const unitPrice = fromMinorUnits(unitMinor);
    const totalAmount = fromMinorUnits(totalMinor);
    const orderId = new ObjectId().toHexString();
    const paymentId = new ObjectId().toHexString();
    const itemId = new ObjectId().toHexString();
    const orderNumber = `JH-${now.toISOString().slice(0, 10).replaceAll('-', '')}-${randomBytes(3).toString('hex').toUpperCase()}`;
    const expiresAt = new Date(now.getTime() + 30 * 60 * 1000);
    const reference = orderNumber;

    await db.orm.customer_order.create({
      _id: orderId,
      order_number: orderNumber,
      user_id: null,
      customer_name: input.customer.name,
      customer_whatsapp: input.customer.whatsapp,
      order_status: 'PENDING_PAYMENT',
      payment_status: 'UNPAID',
      subtotal_amount: totalAmount,
      discount_amount: '0.00',
      total_amount: totalAmount,
      currency: settings.default_currency,
      expires_at: expiresAt,
      created_at: now,
      updated_at: now,
    });
    createdOrderId = orderId;
    await db.orm.order_item.create({
      _id: itemId,
      order_id: orderId,
      game_id: String(game._id),
      category_id: String(service.category._id),
      service_id: String(service._id),
      game_name_snapshot: game.name,
      service_name_snapshot: service.name,
      category_name_snapshot: service.category.name,
      game_account: input.item.gameAccount,
      game_server: input.item.gameServer,
      customer_notes: input.item.customerNotes,
      quantity: input.quantity,
      unit_price: unitPrice,
      line_total: totalAmount,
      estimate_snapshot: service.estimate_text,
    });
    createdItemId = itemId;
    await db.orm.order_payment.create({
      _id: paymentId,
      order_id: orderId,
      method: input.paymentMethod,
      status: 'UNPAID',
      amount: totalAmount,
      reference_note: reference,
      submitted_at: null,
      reviewed_by: null,
      reviewed_at: null,
      review_note: null,
      created_at: now,
      updated_at: now,
    });
    createdPaymentId = paymentId;

    const orderHistoryId = new ObjectId().toHexString();
    const paymentHistoryId = new ObjectId().toHexString();
    await db.orm.order_status_history.create({
      _id: orderHistoryId,
      order_id: orderId,
      old_status: null,
      new_status: 'PENDING_PAYMENT',
      changed_by: null,
      reason: 'Checkout dibuat.',
      changed_at: now,
    });
    createdHistoryIds.push(orderHistoryId);
    await db.orm.payment_status_history.create({
      _id: paymentHistoryId,
      payment_id: paymentId,
      old_status: null,
      new_status: 'UNPAID',
      changed_by: null,
      reason: 'Payment attempt dibuat.',
      changed_at: now,
    });
    createdHistoryIds.push(paymentHistoryId);

    const response: CheckoutResponse = {
      order: {
        id: orderId,
        orderNumber,
        orderStatus: 'PENDING_PAYMENT',
        paymentStatus: 'UNPAID',
        totalAmount: Number(totalMinor) / 100,
        currency: settings.default_currency,
        expiresAt: expiresAt.toISOString(),
        game: { name: game.name },
        service: { id: String(service._id), name: service.name },
        quantity: input.quantity,
      },
      payment: {
        id: paymentId,
        method: input.paymentMethod,
        status: 'UNPAID',
        amount: Number(totalMinor) / 100,
        instructions: { ...instructions, reference },
      },
      nextAction: FEATURE_SPRINT_2 ? 'UPLOAD_PAYMENT_PROOF' : 'REPORT_PAYMENT',
      idempotentReplay: false,
    };
    await db.orm.checkout_idempotency.where({ _id: idempotency.recordId }).update({ response_json: response });
    return response;
  } catch (error) {
    await Promise.all(
      createdHistoryIds.map((id) =>
        db.orm.order_status_history
          .where({ _id: id })
          .delete()
          .catch(() => undefined)
      )
    );
    if (createdPaymentId) {
      await db.orm.payment_status_history
        .where({ payment_id: createdPaymentId })
        .delete()
        .catch(() => undefined);
      await db.orm.order_payment
        .where({ _id: createdPaymentId })
        .delete()
        .catch(() => undefined);
    }
    if (createdItemId)
      await db.orm.order_item
        .where({ _id: createdItemId })
        .delete()
        .catch(() => undefined);
    if (createdOrderId)
      await db.orm.customer_order
        .where({ _id: createdOrderId })
        .delete()
        .catch(() => undefined);
    await db.orm.checkout_idempotency
      .where({ _id: idempotency.recordId })
      .delete()
      .catch(() => undefined);
    if (error instanceof CheckoutError) throw error;
    throw new CheckoutError('ORDT03001', 'Pesanan tidak dapat disimpan saat ini.', 500);
  }
}
