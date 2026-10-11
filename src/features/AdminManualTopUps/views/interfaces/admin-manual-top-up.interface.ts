export type ManualTopUpStatus = 'Menunggu' | 'Diproses' | 'Selesai' | 'Ditolak';
export type ManualTopUpView = {
  id: string;
  customerName: string;
  whatsapp: string;
  game: string;
  accountId: string;
  server: string;
  packageName: string;
  amount: number;
  paymentMethod: string;
  paymentReference: string;
  notes: string;
  status: ManualTopUpStatus;
  createdAt: string;
};
export type ManualTopUpStatusFilter = 'Semua Status' | ManualTopUpStatus;
