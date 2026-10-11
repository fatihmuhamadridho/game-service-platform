export type AnnouncementType = 'Informasi' | 'Promo' | 'Pemeliharaan';
export type AnnouncementAudience = 'Semua Pengguna' | 'Member';
export type AnnouncementStatus = 'Draft' | 'Terjadwal' | 'Terbit';

export type AdminAnnouncementView = {
  id: string;
  title: string;
  content: string;
  type: AnnouncementType;
  audience: AnnouncementAudience;
  status: AnnouncementStatus;
  publishAt: string;
  updatedAt: string;
};

export type AdminAnnouncementForm = Omit<AdminAnnouncementView, 'id' | 'updatedAt'>;
export type AnnouncementStatusFilter = 'Semua Status' | AnnouncementStatus;
export type AnnouncementTypeFilter = 'Semua Jenis' | AnnouncementType;
export type AdminAnnouncementFormMode = 'create' | 'edit' | null;
