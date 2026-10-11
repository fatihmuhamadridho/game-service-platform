export type AdminServiceCategoryView = {
  id: string;
  name: string;
  slug: string;
  description: string;
  serviceCount: number;
  active: boolean;
  updatedAt: string;
};

export type AdminServiceCategoryForm = Omit<AdminServiceCategoryView, 'id' | 'serviceCount' | 'updatedAt'>;
export type AdminServiceCategoryStatusFilter = 'Semua' | 'Aktif' | 'Nonaktif';
export type AdminServiceCategoryFormMode = 'create' | 'edit' | null;
