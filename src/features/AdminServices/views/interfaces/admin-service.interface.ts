export type AdminServiceView = {
  id: string;
  name: string;
  game: string;
  category: string;
  price: number | null;
  estimate: string;
  active: boolean;
  updatedAt: string;
};

export type AdminServiceForm = Omit<AdminServiceView, 'id' | 'updatedAt'>;
export type AdminServiceStatusFilter = 'Semua' | 'Aktif' | 'Nonaktif';
export type AdminServiceFormMode = 'create' | 'edit' | null;
