'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import Image from 'next/image';
import { Box } from 'rangkaui';
import { IconEdit, IconPhoto, IconPlus, IconSearch, IconTrash, IconUpload, IconX } from '@tabler/icons-react';
import { AdminHeader } from '@common-ui/organisms/AdminDashboard/AdminHeader';
import { AdminSidebar } from '@common-ui/organisms/AdminDashboard/AdminSidebar';
import type {
  AdminBannerForm,
  AdminBannerFormMode,
  AdminBannerStatusFilter,
  AdminBannerView,
  BannerPlacement,
} from '../interfaces/admin-banner.interface';
import styles from '../pages/AdminBanners.module.css';

type Props = {
  banners: AdminBannerView[];
  filteredBanners: AdminBannerView[];
  query: string;
  onQueryChange: (value: string) => void;
  statusFilter: AdminBannerStatusFilter;
  onStatusFilterChange: (value: AdminBannerStatusFilter) => void;
  placementFilter: string;
  onPlacementFilterChange: (value: string) => void;
  activeCount: number;
  formMode: AdminBannerFormMode;
  form: AdminBannerForm;
  onFormChange: (updater: (current: AdminBannerForm) => AdminBannerForm) => void;
  onCreate: () => void;
  onEdit: (banner: AdminBannerView) => void;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
  onCloseForm: () => void;
  deleteTarget: AdminBannerView | null;
  onDeleteSelect: (banner: AdminBannerView | null) => void;
  onDeleteConfirm: () => void;
};

const placements: BannerPlacement[] = ['Homepage', 'Halaman Game', 'Promo'];

export const AdminBannersTemplate = ({
  banners,
  filteredBanners,
  query,
  onQueryChange,
  statusFilter,
  onStatusFilterChange,
  placementFilter,
  onPlacementFilterChange,
  activeCount,
  formMode,
  form,
  onFormChange,
  onCreate,
  onEdit,
  onSave,
  onCloseForm,
  deleteTarget,
  onDeleteSelect,
  onDeleteConfirm,
}: Props) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const updateField = <K extends keyof AdminBannerForm>(field: K, value: AdminBannerForm[K]) =>
    onFormChange((current) => ({ ...current, [field]: value }));

  const handleImageSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadError('Pilih file gambar.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Ukuran gambar maksimal 5 MB.');
      return;
    }
    setUploadError('');
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') return;
      onFormChange((current) => ({ ...current, imageUrl: reader.result as string, imageName: file.name }));
    };
    reader.readAsDataURL(file);
  };
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (formMode === 'create' && !form.imageUrl) {
      event.preventDefault();
      setUploadError('Pilih gambar banner yang valid terlebih dahulu.');
      return;
    }
    onSave(event);
  };

  return (
    <main className={styles.page}>
      <AdminHeader query={query} onQueryChange={onQueryChange} onMenuOpen={() => setMenuOpen(true)} />
      <AdminSidebar open={menuOpen} onClose={() => setMenuOpen(false)} activeItem="Banner" />
      <div className={styles.main}>
        <div className={styles.heading}>
          <div>
            <p className={styles.breadcrumb}>
              Dashboard <span>/</span> Konten <span>/</span> <b>Banner</b>
            </p>
            <h1>Kelola Banner</h1>
            <p>Atur materi banner, posisi tayang, dan tautan tujuan.</p>
          </div>
          <button
            className={styles.createButton}
            onClick={() => {
              setUploadError('');
              onCreate();
            }}
          >
            <IconPlus /> Tambah Banner
          </button>
        </div>

        <section className={styles.metrics} aria-label="Ringkasan banner">
          <Box className={styles.metric} bordered rounded>
            <span>Total Banner</span>
            <b>{banners.length}</b>
          </Box>
          <Box className={styles.metric} bordered rounded>
            <span>Banner Aktif</span>
            <b className={styles.activeValue}>{activeCount}</b>
          </Box>
          <Box className={styles.metric} bordered rounded>
            <span>Banner Nonaktif</span>
            <b className={styles.inactiveValue}>{banners.length - activeCount}</b>
          </Box>
        </section>

        <Box className={styles.panel} bordered rounded>
          <div className={styles.toolbar}>
            <div>
              <h2>Daftar Banner</h2>
              <small>{filteredBanners.length} banner ditampilkan</small>
            </div>
            <div className={styles.controls}>
              <label className={styles.search}>
                <IconSearch />
                <input
                  value={query}
                  onChange={(event) => onQueryChange(event.target.value)}
                  placeholder="Cari nama banner..."
                  aria-label="Cari banner"
                />
              </label>
              <label className={styles.filter}>
                <span className={styles.visuallyHidden}>Filter posisi</span>
                <select value={placementFilter} onChange={(event) => onPlacementFilterChange(event.target.value)}>
                  <option>Semua Posisi</option>
                  {placements.map((placement) => (
                    <option key={placement}>{placement}</option>
                  ))}
                </select>
              </label>
              <label className={styles.filter}>
                <span className={styles.visuallyHidden}>Filter status</span>
                <select
                  value={statusFilter}
                  onChange={(event) => onStatusFilterChange(event.target.value as AdminBannerStatusFilter)}
                >
                  <option>Semua</option>
                  <option>Aktif</option>
                  <option>Nonaktif</option>
                </select>
              </label>
            </div>
          </div>
          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>Banner</th>
                  <th>Posisi Tayang</th>
                  <th>Link Tujuan</th>
                  <th>Urutan</th>
                  <th>Status</th>
                  <th>Terakhir Diubah</th>
                  <th>
                    <span className={styles.visuallyHidden}>Aksi</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredBanners.map((banner) => (
                  <tr key={banner.id}>
                    <td>
                      <span className={styles.bannerCell}>
                        <span className={styles.thumbnail}>
                          {banner.imageUrl ? (
                            <Image src={banner.imageUrl} alt="" width={120} height={68} unoptimized />
                          ) : (
                            <IconPhoto />
                          )}
                        </span>
                        <span>
                          <b>{banner.title}</b>
                          <small>{banner.imageName || 'Gambar belum dipilih'}</small>
                        </span>
                      </span>
                    </td>
                    <td>
                      <span className={styles.placement}>{banner.placement}</span>
                    </td>
                    <td>
                      <code>{banner.targetUrl || '—'}</code>
                    </td>
                    <td>{banner.priority}</td>
                    <td>
                      <span
                        className={`${styles.status} ${banner.active ? styles.statusActive : styles.statusInactive}`}
                      >
                        <i />
                        {banner.active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td>{banner.updatedAt}</td>
                    <td>
                      <div className={styles.rowActions}>
                        <button
                          aria-label={`Edit ${banner.title}`}
                          onClick={() => {
                            setUploadError('');
                            onEdit(banner);
                          }}
                        >
                          <IconEdit /> Edit
                        </button>
                        <button
                          className={styles.deleteButton}
                          aria-label={`Hapus ${banner.title}`}
                          onClick={() => onDeleteSelect(banner)}
                        >
                          <IconTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!filteredBanners.length && (
              <div className={styles.empty}>
                <IconPhoto />
                <b>Banner tidak ditemukan</b>
                <span>Coba kata kunci atau filter lain.</span>
              </div>
            )}
          </div>
          <p className={styles.demoNote}>Data contoh. Perubahan dan gambar hanya tersimpan di halaman ini.</p>
        </Box>
      </div>

      {formMode && (
        <div
          className={styles.overlay}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onCloseForm();
          }}
        >
          <section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="banner-dialog-title">
            <div className={styles.dialogHeading}>
              <div>
                <h2 id="banner-dialog-title">{formMode === 'create' ? 'Tambah Banner' : 'Edit Banner'}</h2>
                <p>Atur konten dan penempatan banner.</p>
              </div>
              <button className={styles.closeButton} aria-label="Tutup" onClick={onCloseForm}>
                <IconX />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <label>
                Nama Banner
                <input
                  required
                  autoFocus
                  value={form.title}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => updateField('title', event.target.value)}
                  placeholder="Contoh: Banner Utama"
                />
              </label>
              <label>
                Deskripsi
                <input
                  value={form.description}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => updateField('description', event.target.value)}
                  placeholder="Keterangan internal banner"
                />
              </label>
              <div className={styles.formRow}>
                <label>
                  Posisi Tayang
                  <select
                    value={form.placement}
                    onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                      updateField('placement', event.target.value as BannerPlacement)
                    }
                  >
                    {placements.map((placement) => (
                      <option key={placement}>{placement}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Urutan Tayang
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={form.priority}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      updateField('priority', Math.max(1, Number(event.target.value)))
                    }
                  />
                </label>
              </div>
              <label>
                Link Tujuan
                <input
                  value={form.targetUrl}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => updateField('targetUrl', event.target.value)}
                  placeholder="/games"
                />
              </label>
              <label>
                Gambar Banner
                <input
                  type="file"
                  accept="image/*"
                  required={formMode === 'create' && !form.imageUrl}
                  onChange={handleImageSelect}
                />
                <small className={styles.fieldHint}>
                  Format gambar, maksimal 5 MB. Gambar hanya dipratinjau lokal.
                </small>
              </label>
              {uploadError && (
                <p className={styles.uploadError} role="alert">
                  {uploadError}
                </p>
              )}
              <div className={styles.preview}>
                {form.imageUrl ? (
                  <Image src={form.imageUrl} alt="Pratinjau banner yang dipilih" width={800} height={300} unoptimized />
                ) : (
                  <span>
                    <IconPhoto />
                    <b>Pratinjau banner</b>
                    <small>Pilih gambar untuk melihat pratinjau.</small>
                  </span>
                )}
              </div>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => updateField('active', event.target.checked)}
                />
                <span>Banner aktif dan dapat ditayangkan</span>
              </label>
              <div className={styles.dialogActions}>
                <button type="button" className={styles.cancelButton} onClick={onCloseForm}>
                  Batal
                </button>
                <button type="submit" className={styles.createButton}>
                  {formMode === 'create' ? 'Simpan Banner' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {deleteTarget && (
        <div
          className={styles.overlay}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onDeleteSelect(null);
          }}
        >
          <section className={styles.dialog} role="alertdialog" aria-modal="true" aria-labelledby="delete-banner-title">
            <div className={styles.dialogHeading}>
              <div>
                <h2 id="delete-banner-title">Hapus banner {deleteTarget.title}?</h2>
                <p>Banner akan dihapus dari daftar pada sesi ini.</p>
              </div>
              <button className={styles.closeButton} aria-label="Tutup" onClick={() => onDeleteSelect(null)}>
                <IconX />
              </button>
            </div>
            <div className={styles.dialogActions}>
              <button className={styles.cancelButton} onClick={() => onDeleteSelect(null)}>
                Batal
              </button>
              <button className={`${styles.createButton} ${styles.confirmDelete}`} onClick={onDeleteConfirm}>
                <IconTrash /> Hapus Banner
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
};
