export type AdminFaqStatus = 'Published' | 'Draft';
export type AdminFaqView = {
  id: string;
  question: string;
  answer: string;
  category: string;
  status: AdminFaqStatus;
  updatedAt: string;
};
export type AdminFaqForm = Omit<AdminFaqView, 'id' | 'updatedAt'>;
export type AdminFaqStatusFilter = 'Semua Status' | AdminFaqStatus;
export type AdminFaqFormMode = 'create' | 'edit' | null;
