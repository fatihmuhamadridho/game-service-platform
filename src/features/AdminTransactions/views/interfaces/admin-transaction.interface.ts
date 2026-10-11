export type TransactionStatus = 'Berhasil' | 'Menunggu' | 'Gagal' | 'Dikembalikan';
export type TransactionType = 'Pembayaran Pesanan' | 'Refund';
export type TransactionMethod = 'QRIS' | 'BCA Virtual Account';
export type TransactionView = {
  id: string;
  orderId: string;
  customerName: string;
  customerContact: string;
  type: TransactionType;
  method: TransactionMethod;
  amount: number;
  status: TransactionStatus;
  providerReference: string;
  createdAt: string;
  settledAt: string;
};
export type TransactionStatusFilter = 'Semua Status' | TransactionStatus;
export type TransactionMethodFilter = 'Semua Metode' | TransactionMethod;
