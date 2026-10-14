import { ObjectId } from 'mongodb';
import { db } from '@prisma/db';

export class AdminTransactionError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status: number
  ) {
    super(message);
  }
}

const statusLabel = (status: string) =>
  ({
    SUCCESS: 'Berhasil',
    SETTLED: 'Berhasil',
    COMPLETED: 'Berhasil',
    PENDING: 'Menunggu',
    PROCESSING: 'Menunggu',
    FAILED: 'Gagal',
    CANCELLED: 'Gagal',
    REFUNDED: 'Dikembalikan',
  })[status] ?? status;
const typeLabel = (type: string) => (type === 'REFUND' ? 'Refund' : 'Pembayaran Pesanan');
const methodLabel = (method: string) => (method === 'BCA_TRANSFER' ? 'Transfer Bank BCA' : method);
const amount = (value: unknown) => Number(String(value ?? 0)) || 0;

type TransactionRow = {
  _id: unknown;
  transaction_number: string;
  order_id: unknown;
  type: string;
  method: string;
  amount: string;
  status: string;
  provider_reference: string | null;
  customer_name_snapshot: string | null;
  customer_contact_snapshot: string | null;
  created_at: Date;
  settled_at: Date | null;
};

const transactionView = (row: TransactionRow) => ({
  id: row.transaction_number,
  internalId: String(row._id),
  orderId: String(row.order_id),
  customerName: row.customer_name_snapshot ?? 'Pelanggan',
  customerContact: row.customer_contact_snapshot ?? '',
  type: typeLabel(row.type),
  method: methodLabel(row.method),
  amount: amount(row.amount),
  status: statusLabel(row.status),
  providerReference: row.provider_reference ?? '',
  createdAt: row.created_at.toISOString(),
  settledAt: row.settled_at?.toISOString() ?? '',
});

export async function listAdminTransactions(params: {
  search: string;
  status: string;
  method: string;
  type: string;
  page: number;
  pageSize: number;
}) {
  const rows = await db.orm.financial_transaction.all();
  const search = params.search.toLocaleLowerCase('id-ID');
  const filtered = rows
    .map(transactionView)
    .filter(
      (row) =>
        (!params.status || row.status === params.status) &&
        (!params.method || row.method === params.method) &&
        (!params.type || row.type === params.type) &&
        (!search ||
          `${row.id} ${row.orderId} ${row.customerName} ${row.customerContact} ${row.providerReference}`
            .toLocaleLowerCase('id-ID')
            .includes(search))
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const start = (params.page - 1) * params.pageSize;
  return {
    transactions: filtered.slice(start, start + params.pageSize),
    total: filtered.length,
    pagination: {
      page: params.page,
      pageSize: params.pageSize,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / params.pageSize),
    },
    summary: {
      successfulAmount: filtered.filter((row) => row.status === 'Berhasil').reduce((sum, row) => sum + row.amount, 0),
      pendingCount: filtered.filter((row) => row.status === 'Menunggu').length,
      refundedCount: filtered.filter((row) => row.status === 'Dikembalikan').length,
    },
  };
}

export async function getAdminTransaction(id: string) {
  if (!ObjectId.isValid(id)) throw new AdminTransactionError('TRNB02001', 'ID transaksi tidak valid.', 400);
  const row = await db.orm.financial_transaction.where({ _id: id }).first();
  if (!row) throw new AdminTransactionError('TRNB02002', 'Transaksi tidak ditemukan.', 404);
  const history = await db.orm.transaction_status_history.all();
  return {
    ...transactionView(row),
    statusHistory: history
      .filter((event) => String(event.transaction_id) === id)
      .sort((a, b) => a.changed_at.getTime() - b.changed_at.getTime())
      .map((event) => ({
        oldStatus: event.old_status,
        newStatus: event.new_status,
        reason: event.reason,
        occurredAt: event.changed_at.toISOString(),
      })),
  };
}

export function toAdminTransactionError(error: unknown) {
  if (error instanceof AdminTransactionError) return error;
  return new AdminTransactionError('TRNT03001', 'Data transaksi sementara tidak tersedia.', 500);
}
