export type AdminOrderStatus = 'Menunggu Pembayaran' | 'Menunggu Validasi' | 'Diproses' | 'Selesai' | 'Dibatalkan';
export type AdminPaymentStatus = 'Belum Dibayar' | 'Menunggu Validasi' | 'Dibayar' | 'Gagal';
export type AdminOrderView = {
  id: string;
  internalId: string;
  customerName: string;
  whatsapp: string;
  game: string;
  service: string;
  gameAccount: string;
  server: string;
  amount: number;
  status: AdminOrderStatus;
  rawStatus?: string;
  paymentMethod: string;
  paymentStatus: AdminPaymentStatus;
  paymentId?: string;
  createdAt: string;
  proofs?: Array<{
    id: string;
    paymentId: string;
    mimeType: string;
    fileSizeBytes: number;
    uploadedAt: string;
    viewUrl: string | null;
  }>;
};
export type AdminOrderStatusFilter = 'Semua Status' | AdminOrderStatus;
