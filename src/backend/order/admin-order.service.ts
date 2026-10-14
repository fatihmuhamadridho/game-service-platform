import { ObjectId } from 'mongodb';
import { randomBytes } from 'node:crypto';
import { db } from '@prisma/db';
import { createPrivateObjectViewUrl } from './private-object-storage.service';

export class AdminOrderError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status: number
  ) {
    super(message);
  }
}

const orderLabels: Record<string, string> = {
  PENDING_PAYMENT: 'Menunggu Pembayaran',
  PENDING_VALIDATION: 'Menunggu Validasi',
  PROCESSING: 'Diproses',
  COMPLETED: 'Selesai',
  CANCELLED: 'Dibatalkan',
};
const paymentLabels: Record<string, string> = {
  UNPAID: 'Belum Dibayar',
  PENDING: 'Menunggu Validasi',
  PENDING_REVIEW: 'Menunggu Validasi',
  PENDING_VALIDATION: 'Menunggu Validasi',
  PAID: 'Dibayar',
  FAILED: 'Gagal',
  EXPIRED: 'Gagal',
  REFUNDED: 'Dikembalikan',
};
const labelStatus = (value: string, labels: Record<string, string>) => labels[value] ?? value;
const amount = (value: unknown) => Number(String(value ?? '0')) || 0;

type OrderViewSource = {
  _id: unknown;
  order_number: string;
  customer_name: string;
  customer_whatsapp: string;
  total_amount: string;
  order_status: string;
  payment_status: string;
  created_at: Date;
  items: Array<{ game_name_snapshot: string; service_name_snapshot: string }>;
  payments: Array<{ created_at: Date; method: string; status: string }>;
};

function orderView(order: OrderViewSource) {
  const item = order.items?.[0];
  const payment = [...(order.payments ?? [])].sort((a, b) => b.created_at.getTime() - a.created_at.getTime())[0];
  return {
    id: order.order_number,
    internalId: String(order._id),
    customerName: order.customer_name,
    whatsapp: order.customer_whatsapp,
    game: item?.game_name_snapshot ?? 'Game',
    service: item?.service_name_snapshot ?? 'Layanan',
    amount: amount(order.total_amount),
    status: labelStatus(order.order_status, orderLabels),
    rawStatus: order.order_status,
    paymentMethod: payment?.method ?? '—',
    paymentStatus: labelStatus(payment?.status ?? order.payment_status, paymentLabels),
    createdAt: order.created_at.toISOString(),
  };
}

export async function listAdminOrders(params: { search?: string; status?: string; page: number; pageSize: number }) {
  const rows = await db.orm.customer_order.include('items').include('payments').all();
  const search = params.search?.trim().toLocaleLowerCase('id-ID') ?? '';
  const filtered = rows
    .filter((row) => {
      const view = orderView(row);
      return (
        (!params.status || params.status === 'Semua Status' || view.status === params.status) &&
        (!search ||
          `${view.id} ${view.customerName} ${view.whatsapp} ${view.game} ${view.service}`
            .toLocaleLowerCase('id-ID')
            .includes(search))
      );
    })
    .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
  const total = filtered.length;
  const start = (params.page - 1) * params.pageSize;
  return {
    orders: filtered.slice(start, start + params.pageSize).map(orderView),
    pagination: { page: params.page, pageSize: params.pageSize, total, totalPages: Math.ceil(total / params.pageSize) },
  };
}

export async function getAdminOrder(id: string) {
  if (!ObjectId.isValid(id)) throw new AdminOrderError('ORDB02001', 'ID pesanan tidak valid.', 400);
  const order = await db.orm.customer_order
    .where({ _id: id })
    .include('items')
    .include('payments')
    .include('status_history')
    .first();
  if (!order) throw new AdminOrderError('ORDB02002', 'Pesanan tidak ditemukan.', 404);
  const payments = order.payments.map((payment) => ({
    id: String(payment._id),
    method: payment.method,
    status: payment.status,
    amount: amount(payment.amount),
    referenceNote: payment.reference_note,
    submittedAt: payment.submitted_at?.toISOString() ?? null,
    reviewedAt: payment.reviewed_at?.toISOString() ?? null,
    reviewNote: payment.review_note,
  }));
  const proofRows = await db.orm.payment_proof.all();
  const paymentIds = new Set(order.payments.map((payment) => String(payment._id)));
  const proofs = await Promise.all(
    proofRows
      .filter((proof) => paymentIds.has(String(proof.payment_id)))
      .map(async (proof) => {
        let viewUrl: string | null = null;
        try {
          viewUrl = await createPrivateObjectViewUrl(proof.object_key);
        } catch {
          /* Storage may be unavailable. */
        }
        return {
          id: String(proof._id),
          paymentId: String(proof.payment_id),
          mimeType: proof.mime_type,
          fileSizeBytes: proof.file_size_bytes,
          uploadedAt: proof.uploaded_at.toISOString(),
          viewUrl,
        };
      })
  );
  return {
    ...orderView(order),
    customerWhatsapp: order.customer_whatsapp,
    subtotal: amount(order.subtotal_amount),
    discount: amount(order.discount_amount),
    currency: order.currency,
    expiresAt: order.expires_at?.toISOString() ?? null,
    items: order.items.map((item) => ({
      id: String(item._id),
      gameName: item.game_name_snapshot,
      serviceName: item.service_name_snapshot,
      categoryName: item.category_name_snapshot,
      gameAccount: item.game_account,
      gameServer: item.game_server,
      customerNotes: item.customer_notes,
      quantity: item.quantity,
      unitPrice: item.unit_price === null ? null : amount(item.unit_price),
      lineTotal: item.line_total === null ? null : amount(item.line_total),
      estimate: item.estimate_snapshot,
    })),
    payments,
    proofs,
    statusHistory: order.status_history
      .sort((a, b) => a.changed_at.getTime() - b.changed_at.getTime())
      .map((event) => ({
        oldStatus: event.old_status,
        newStatus: event.new_status,
        reason: event.reason,
        occurredAt: event.changed_at.toISOString(),
      })),
  };
}

export async function reviewOrderPayment(input: {
  orderId: string;
  paymentId: string;
  decision: 'APPROVE' | 'REJECT';
  note: string | null;
  adminId: string;
}) {
  if (!ObjectId.isValid(input.orderId) || !ObjectId.isValid(input.paymentId) || !ObjectId.isValid(input.adminId)) {
    throw new AdminOrderError('ORDB02001', 'ID pesanan atau pembayaran tidak valid.', 400);
  }
  const order = await db.orm.customer_order.where({ _id: input.orderId }).first();
  const payment = await db.orm.order_payment.where({ _id: input.paymentId }).first();
  if (!order || !payment || String(payment.order_id) !== input.orderId) {
    throw new AdminOrderError('ORDB02002', 'Pesanan atau pembayaran tidak ditemukan.', 404);
  }
  if (payment.status !== 'PENDING_REVIEW') {
    throw new AdminOrderError('ORDB02004', 'Pembayaran sudah ditinjau atau tidak menunggu validasi.', 409);
  }
  const now = new Date();
  const retryAllowed = Boolean(order.expires_at && order.expires_at > now);
  const nextPaymentStatus = input.decision === 'APPROVE' ? 'PAID' : retryAllowed ? 'UNPAID' : 'FAILED';
  const nextOrderStatus = input.decision === 'APPROVE' ? 'PROCESSING' : retryAllowed ? 'PENDING_PAYMENT' : 'CANCELLED';
  const paymentClaimed = await db.orm.order_payment
    .where({ _id: input.paymentId, order_id: input.orderId, status: 'PENDING_REVIEW' })
    .updateAndCount({
      status: nextPaymentStatus,
      reviewed_by: input.adminId,
      reviewed_at: now,
      review_note: input.note,
      submitted_at: input.decision === 'REJECT' && retryAllowed ? null : payment.submitted_at,
      updated_at: now,
    });
  if (paymentClaimed !== 1) throw new AdminOrderError('ORDB02004', 'Pembayaran sedang ditinjau oleh admin lain.', 409);

  let transactionId = '';
  let transactionHistoryId = '';
  let paymentHistoryId = '';
  let orderHistoryId = '';
  try {
    await db.orm.customer_order.where({ _id: input.orderId }).update({
      payment_status: nextPaymentStatus,
      order_status: nextOrderStatus,
      updated_at: now,
    });
    paymentHistoryId = new ObjectId().toHexString();
    await db.orm.payment_status_history.create({
      _id: paymentHistoryId,
      payment_id: input.paymentId,
      old_status: 'PENDING_REVIEW',
      new_status: nextPaymentStatus,
      changed_by: input.adminId,
      reason:
        input.note ??
        (input.decision === 'APPROVE'
          ? 'Konfirmasi pembayaran disetujui.'
          : retryAllowed
            ? 'Konfirmasi pembayaran ditolak; order masih berlaku untuk konfirmasi ulang.'
            : 'Konfirmasi pembayaran ditolak setelah order kedaluwarsa.'),
      changed_at: now,
    });
    orderHistoryId = new ObjectId().toHexString();
    await db.orm.order_status_history.create({
      _id: orderHistoryId,
      order_id: input.orderId,
      old_status: order.order_status,
      new_status: nextOrderStatus,
      changed_by: input.adminId,
      reason:
        input.note ??
        (input.decision === 'APPROVE'
          ? 'Pembayaran disetujui admin.'
          : retryAllowed
            ? 'Konfirmasi pembayaran ditolak admin; pelanggan dapat konfirmasi ulang.'
            : 'Pembayaran ditolak admin setelah order kedaluwarsa.'),
      changed_at: now,
    });

    if (input.decision === 'APPROVE') {
      transactionId = new ObjectId().toHexString();
      await db.orm.financial_transaction.create({
        _id: transactionId,
        transaction_number: `JHT-${now.toISOString().slice(0, 10).replaceAll('-', '')}-${randomBytes(4).toString('hex').toUpperCase()}`,
        order_id: input.orderId,
        order_payment_id: input.paymentId,
        refund_request_id: null,
        type: 'PAYMENT',
        method: payment.method,
        amount: payment.amount.toString(),
        currency: order.currency,
        status: 'SUCCESS',
        provider_reference: null,
        customer_name_snapshot: order.customer_name,
        customer_contact_snapshot: order.customer_whatsapp,
        created_at: now,
        updated_at: now,
        settled_at: now,
      });
      transactionHistoryId = new ObjectId().toHexString();
      await db.orm.transaction_status_history.create({
        _id: transactionHistoryId,
        transaction_id: transactionId,
        old_status: null,
        new_status: 'SUCCESS',
        changed_by: input.adminId,
        reason: 'Pembayaran manual disetujui admin.',
        changed_at: now,
      });
    }
    return { paymentStatus: nextPaymentStatus, orderStatus: nextOrderStatus };
  } catch {
    if (transactionHistoryId)
      await db.orm.transaction_status_history
        .where({ _id: transactionHistoryId })
        .delete()
        .catch(() => undefined);
    if (transactionId)
      await db.orm.financial_transaction
        .where({ _id: transactionId })
        .delete()
        .catch(() => undefined);
    if (paymentHistoryId)
      await db.orm.payment_status_history
        .where({ _id: paymentHistoryId })
        .delete()
        .catch(() => undefined);
    if (orderHistoryId)
      await db.orm.order_status_history
        .where({ _id: orderHistoryId })
        .delete()
        .catch(() => undefined);
    await db.orm.customer_order
      .where({ _id: input.orderId })
      .update({
        payment_status: order.payment_status,
        order_status: order.order_status,
        updated_at: new Date(),
      })
      .catch(() => undefined);
    await db.orm.order_payment
      .where({ _id: input.paymentId, status: nextPaymentStatus })
      .update({
        status: 'PENDING_REVIEW',
        reviewed_by: null,
        reviewed_at: null,
        review_note: null,
        submitted_at: payment.submitted_at,
        updated_at: new Date(),
      })
      .catch(() => undefined);
    throw new AdminOrderError('ORDT03001', 'Hasil pemeriksaan pembayaran tidak dapat disimpan.', 500);
  }
}

export async function completeAdminOrder(input: { orderId: string; adminId: string }) {
  if (!ObjectId.isValid(input.orderId) || !ObjectId.isValid(input.adminId)) {
    throw new AdminOrderError('ORDB02001', 'ID pesanan atau admin tidak valid.', 400);
  }
  const order = await db.orm.customer_order.where({ _id: input.orderId }).first();
  if (!order) throw new AdminOrderError('ORDB02002', 'Pesanan tidak ditemukan.', 404);
  if (order.order_status !== 'PROCESSING' || order.payment_status !== 'PAID') {
    throw new AdminOrderError(
      'ORDB02004',
      'Hanya pesanan diproses dengan pembayaran tervalidasi yang dapat diselesaikan.',
      409
    );
  }

  const now = new Date();
  const changed = await db.orm.customer_order
    .where({ _id: input.orderId, order_status: 'PROCESSING', payment_status: 'PAID' })
    .updateAndCount({ order_status: 'COMPLETED', updated_at: now });
  if (changed !== 1)
    throw new AdminOrderError('ORDB02004', 'Status pesanan sedang diperbarui. Muat ulang pesanan.', 409);

  const historyId = new ObjectId().toHexString();
  try {
    await db.orm.order_status_history.create({
      _id: historyId,
      order_id: input.orderId,
      old_status: 'PROCESSING',
      new_status: 'COMPLETED',
      changed_by: input.adminId,
      reason: 'Layanan pesanan diselesaikan admin.',
      changed_at: now,
    });
  } catch {
    await db.orm.customer_order
      .where({ _id: input.orderId, order_status: 'COMPLETED' })
      .update({ order_status: 'PROCESSING', updated_at: new Date() })
      .catch(() => undefined);
    throw new AdminOrderError('ORDT03001', 'Status pesanan tidak dapat disimpan.', 500);
  }
  return { orderStatus: 'COMPLETED' };
}

export function toAdminOrderError(error: unknown) {
  if (error instanceof AdminOrderError) return error;
  return new AdminOrderError('ORDT03001', 'Data pesanan sementara tidak tersedia.', 500);
}
