export type ComplaintStatus = 'Baru' | 'Diproses' | 'Menunggu Pengguna' | 'Selesai';
export type ComplaintPriority = 'Rendah' | 'Normal' | 'Tinggi' | 'Urgent';
export type ComplaintMessage = {
  id: string;
  sender: string;
  role: 'Pengguna' | 'Admin';
  message: string;
  sentAt: string;
};
export type ComplaintView = {
  id: string;
  orderId: string;
  customerName: string;
  whatsapp: string;
  subject: string;
  category: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  createdAt: string;
  messages: ComplaintMessage[];
};
export type ComplaintStatusFilter = 'Semua Status' | ComplaintStatus;
export type ComplaintPriorityFilter = 'Semua Prioritas' | ComplaintPriority;
