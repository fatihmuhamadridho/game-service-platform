export type GamePlatform = 'Mobile' | 'PC' | 'Console';

export type AdminGameView = {
  id: string;
  name: string;
  slug: string;
  platform: GamePlatform;
  serviceCount: number;
  active: boolean;
  updatedAt: string;
};

export type AdminGameForm = Omit<AdminGameView, 'id' | 'updatedAt'>;
export type AdminGameStatusFilter = 'Semua' | 'Aktif' | 'Nonaktif';
export type AdminGameFormMode = 'create' | 'edit' | null;
