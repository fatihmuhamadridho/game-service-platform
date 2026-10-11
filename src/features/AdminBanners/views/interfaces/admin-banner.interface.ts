export type BannerPlacement = 'Homepage' | 'Halaman Game' | 'Promo';

export type AdminBannerView = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  imageName: string;
  targetUrl: string;
  placement: BannerPlacement;
  active: boolean;
  priority: number;
  updatedAt: string;
};

export type AdminBannerForm = Omit<AdminBannerView, 'id' | 'updatedAt'>;
export type AdminBannerStatusFilter = 'Semua' | 'Aktif' | 'Nonaktif';
export type AdminBannerFormMode = 'create' | 'edit' | null;
