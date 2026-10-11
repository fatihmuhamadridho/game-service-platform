export type RefundStatus = 'Menunggu Review' | 'Disetujui' | 'Ditolak' | 'Selesai';
export type RefundView = {
  id: string;
  orderId: string;
  customerName: string;
  whatsapp: string;
  game: string;
  service: string;
  amount: number;
  paymentMethod: string;
  reason: string;
  adminNote: string;
  status: RefundStatus;
  requestedAt: string;
};
export type RefundStatusFilter = 'Semua Status' | RefundStatus;
