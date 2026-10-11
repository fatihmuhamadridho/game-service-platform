export type PayoutStatus = 'Menunggu Review' | 'Diproses' | 'Berhasil' | 'Ditolak';
export type PayoutView = {
  id: string;
  partnerName: string;
  partnerContact: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  reference: string;
  note: string;
  status: PayoutStatus;
  requestedAt: string;
  processedAt: string;
};
export type PayoutStatusFilter = 'Semua Status' | PayoutStatus;
