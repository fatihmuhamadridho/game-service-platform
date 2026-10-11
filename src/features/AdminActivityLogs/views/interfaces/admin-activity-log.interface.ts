export type ActivityCategory = 'Semua Kategori' | 'Pesanan' | 'Produk' | 'Pengguna' | 'Konten' | 'Pengaturan';
export type ActivityCategoryValue = Exclude<ActivityCategory, 'Semua Kategori'>;
export type ActivityLogView = {
  id: string;
  adminName: string;
  adminEmail: string;
  action: string;
  target: string;
  category: ActivityCategoryValue;
  occurredAt: string;
  ipAddress: string;
  result: 'Berhasil' | 'Gagal';
};
