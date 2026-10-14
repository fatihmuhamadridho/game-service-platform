export type AdminServiceView = {
  id: string;
  name: string;
  gameId: string;
  game: string;
  categoryId: string;
  category: string;
  price: number | null;
  estimate: string;
  active: boolean;
  updatedAt: string;
};

export type AdminServiceForm = Omit<AdminServiceView, 'id' | 'updatedAt' | 'game' | 'category'>;
export type AdminServiceStatusFilter = 'Semua' | 'Aktif' | 'Nonaktif';
export type AdminServiceFormMode = 'create' | 'edit' | null;
