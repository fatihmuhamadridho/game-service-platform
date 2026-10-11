export type AdminPageStatus = 'Published' | 'Draft';

export type AdminPageView = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  status: AdminPageStatus;
  updatedAt: string;
};

export type AdminPageForm = Omit<AdminPageView, 'id' | 'updatedAt'>;
export type AdminPageStatusFilter = 'Semua Status' | AdminPageStatus;
export type AdminPageFormMode = 'create' | 'edit' | null;
