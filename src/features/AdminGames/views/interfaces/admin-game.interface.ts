export type AdminGameView = {
  id: string;
  name: string;
  slug: string;
  serviceSummary: string | null;
  artworkKey: string | null;
  serviceCount: number;
  active: boolean;
  popular: boolean;
  sortOrder: number;
  updatedAt: string;
};

export type AdminGameForm = Pick<
  AdminGameView,
  'name' | 'slug' | 'serviceSummary' | 'artworkKey' | 'active' | 'popular' | 'sortOrder'
>;
export type AdminGameStatusFilter = 'Semua' | 'Aktif' | 'Nonaktif';
export type AdminGameFormMode = 'create' | 'edit' | null;
