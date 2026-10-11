export type AdminOrderStatus = 'Menunggu Pembayaran' | 'Menunggu Validasi' | 'Diproses' | 'Selesai' | 'Dibatalkan';
export type AdminPaymentStatus = 'Belum Dibayar' | 'Menunggu Validasi' | 'Dibayar' | 'Gagal';
export type AdminOrderView = {
  id: string;
  customerName: string;
  whatsapp: string;
  game: string;
  service: string;
  gameAccount: string;
  server: string;
  amount: number;
  status: AdminOrderStatus;
  paymentMethod: string;
  paymentStatus: AdminPaymentStatus;
  createdAt: string;
};
export type AdminOrderStatusFilter = 'Semua Status' | AdminOrderStatus;
