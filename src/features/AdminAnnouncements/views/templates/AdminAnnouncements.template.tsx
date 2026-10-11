'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Box } from 'rangkaui';
import { IconEdit, IconBell, IconPlus, IconSearch, IconTrash, IconX } from '@tabler/icons-react';
import { AdminHeader } from '@common-ui/organisms/AdminDashboard/AdminHeader';
import { AdminSidebar } from '@common-ui/organisms/AdminDashboard/AdminSidebar';
import type {
  AdminAnnouncementForm,
  AdminAnnouncementFormMode,
  AdminAnnouncementView,
  AnnouncementAudience,
  AnnouncementStatus,
  AnnouncementStatusFilter,
  AnnouncementType,
  AnnouncementTypeFilter,
} from '../interfaces/admin-announcement.interface';
import styles from '../pages/AdminAnnouncements.module.css';

type Props = {
  announcements: AdminAnnouncementView[];
  filteredAnnouncements: AdminAnnouncementView[];
  query: string;
  onQueryChange: (value: string) => void;
  statusFilter: AnnouncementStatusFilter;
  onStatusFilterChange: (value: AnnouncementStatusFilter) => void;
  typeFilter: AnnouncementTypeFilter;
  onTypeFilterChange: (value: AnnouncementTypeFilter) => void;
  publishedCount: number;
  scheduledCount: number;
  formMode: AdminAnnouncementFormMode;
  form: AdminAnnouncementForm;
  onFormChange: (updater: (current: AdminAnnouncementForm) => AdminAnnouncementForm) => void;
  onCreate: () => void;
  onEdit: (announcement: AdminAnnouncementView) => void;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
  onCloseForm: () => void;
  deleteTarget: AdminAnnouncementView | null;
  onDeleteSelect: (announcement: AdminAnnouncementView | null) => void;
  onDeleteConfirm: () => void;
};

const formatDate = (value: string) =>
  value
    ? new Date(value).toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Belum dijadwalkan';

export const AdminAnnouncementsTemplate = ({
  announcements,
  filteredAnnouncements,
  query,
  onQueryChange,
  statusFilter,
  onStatusFilterChange,
  typeFilter,
  onTypeFilterChange,
  publishedCount,
  scheduledCount,
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
  const updateField = <K extends keyof AdminAnnouncementForm>(field: K, value: AdminAnnouncementForm[K]) =>
    onFormChange((current) => ({ ...current, [field]: value }));

  return (
    <main className={styles.page}>
      <AdminHeader query={query} onQueryChange={onQueryChange} onMenuOpen={() => setMenuOpen(true)} />
      <AdminSidebar open={menuOpen} onClose={() => setMenuOpen(false)} activeItem="Pengumuman" />
      <div className={styles.main}>
        <div className={styles.heading}>
          <div>
            <p className={styles.breadcrumb}>
              Dashboard <span>/</span> Konten <span>/</span> <b>Pengumuman</b>
            </p>
            <h1>Kelola Pengumuman</h1>
            <p>Buat dan atur informasi yang ditampilkan kepada pengguna.</p>
          </div>
          <button className={styles.createButton} onClick={onCreate}>
            <IconPlus /> Buat Pengumuman
          </button>
        </div>

        <section className={styles.metrics} aria-label="Ringkasan pengumuman">
          <Box className={styles.metric} bordered rounded>
            <span>Total Pengumuman</span>
            <b>{announcements.length}</b>
          </Box>
          <Box className={styles.metric} bordered rounded>
            <span>Sudah Terbit</span>
            <b className={styles.publishedValue}>{publishedCount}</b>
          </Box>
          <Box className={styles.metric} bordered rounded>
            <span>Terjadwal</span>
            <b className={styles.scheduledValue}>{scheduledCount}</b>
          </Box>
        </section>

        <Box className={styles.panel} bordered rounded>
          <div className={styles.toolbar}>
            <div>
              <h2>Daftar Pengumuman</h2>
              <small>{filteredAnnouncements.length} pengumuman ditampilkan</small>
            </div>
            <div className={styles.controls}>
              <label className={styles.search}>
                <IconSearch />
                <input
                  value={query}
                  onChange={(event) => onQueryChange(event.target.value)}
                  placeholder="Cari judul pengumuman..."
                  aria-label="Cari pengumuman"
                />
              </label>
              <label className={styles.filter}>
                <span className={styles.visuallyHidden}>Filter jenis</span>
                <select
                  value={typeFilter}
                  onChange={(event) => onTypeFilterChange(event.target.value as AnnouncementTypeFilter)}
                >
                  <option>Semua Jenis</option>
                  <option>Informasi</option>
                  <option>Promo</option>
                  <option>Pemeliharaan</option>
                </select>
              </label>
              <label className={styles.filter}>
                <span className={styles.visuallyHidden}>Filter status</span>
                <select
                  value={statusFilter}
                  onChange={(event) => onStatusFilterChange(event.target.value as AnnouncementStatusFilter)}
                >
                  <option>Semua Status</option>
                  <option>Draft</option>
                  <option>Terjadwal</option>
                  <option>Terbit</option>
                </select>
              </label>
            </div>
          </div>
          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>Pengumuman</th>
                  <th>Jenis</th>
                  <th>Audiens</th>
                  <th>Jadwal Tayang</th>
                  <th>Status</th>
                  <th>Terakhir Diubah</th>
                  <th>
                    <span className={styles.visuallyHidden}>Aksi</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAnnouncements.map((announcement) => (
                  <tr key={announcement.id}>
                    <td>
                      <span className={styles.announcementCell}>
                        <i>
                          <IconBell />
                        </i>
                        <span>
                          <b>{announcement.title}</b>
                          <small>{announcement.content}</small>
                        </span>
                      </span>
                    </td>
                    <td>
                      <span className={styles.type}>{announcement.type}</span>
                    </td>
                    <td>{announcement.audience}</td>
                    <td>{formatDate(announcement.publishAt)}</td>
                    <td>
                      <span className={`${styles.status} ${styles[`status${announcement.status}`]}`}>
                        <i />
                        {announcement.status}
                      </span>
                    </td>
                    <td>{announcement.updatedAt}</td>
                    <td>
                      <div className={styles.rowActions}>
                        <button aria-label={`Edit ${announcement.title}`} onClick={() => onEdit(announcement)}>
                          <IconEdit /> Edit
                        </button>
                        <button
                          className={styles.deleteButton}
                          aria-label={`Hapus ${announcement.title}`}
                          onClick={() => onDeleteSelect(announcement)}
                        >
                          <IconTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!filteredAnnouncements.length && (
              <div className={styles.empty}>
                <IconBell />
                <b>Pengumuman tidak ditemukan</b>
                <span>Coba kata kunci atau filter lain.</span>
              </div>
            )}
          </div>
          <p className={styles.demoNote}>Data contoh. Perubahan hanya tersimpan selama halaman ini terbuka.</p>
        </Box>
      </div>

      {formMode && (
        <div
          className={styles.overlay}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onCloseForm();
          }}
        >
          <section
            className={styles.dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="announcement-dialog-title"
          >
            <div className={styles.dialogHeading}>
              <div>
                <h2 id="announcement-dialog-title">{formMode === 'create' ? 'Buat Pengumuman' : 'Edit Pengumuman'}</h2>
                <p>Atur konten, audiens, dan jadwal tayang.</p>
              </div>
              <button className={styles.closeButton} aria-label="Tutup" onClick={onCloseForm}>
                <IconX />
              </button>
            </div>
            <form onSubmit={onSave}>
              <label>
                Judul
                <input
                  required
                  autoFocus
                  value={form.title}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => updateField('title', event.target.value)}
                  placeholder="Judul pengumuman"
                />
              </label>
              <label>
                Isi Pengumuman
                <textarea
                  required
                  rows={5}
                  value={form.content}
                  onChange={(event: ChangeEvent<HTMLTextAreaElement>) => updateField('content', event.target.value)}
                  placeholder="Tulis informasi untuk pengguna..."
                />
              </label>
              <div className={styles.formRow}>
                <label>
                  Jenis
                  <select
                    value={form.type}
                    onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                      updateField('type', event.target.value as AnnouncementType)
                    }
                  >
                    <option>Informasi</option>
                    <option>Promo</option>
                    <option>Pemeliharaan</option>
                  </select>
                </label>
                <label>
                  Audiens
                  <select
                    value={form.audience}
                    onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                      updateField('audience', event.target.value as AnnouncementAudience)
                    }
                  >
                    <option>Semua Pengguna</option>
                    <option>Member</option>
                  </select>
                </label>
              </div>
              <div className={styles.formRow}>
                <label>
                  Status
                  <select
                    value={form.status}
                    onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                      updateField('status', event.target.value as AnnouncementStatus)
                    }
                  >
                    <option>Draft</option>
                    <option>Terjadwal</option>
                    <option>Terbit</option>
                  </select>
                </label>
                <label>
                  Jadwal Tayang
                  <input
                    type="datetime-local"
                    required={form.status === 'Terjadwal'}
                    value={form.publishAt}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => updateField('publishAt', event.target.value)}
                  />
                </label>
              </div>
              <p className={styles.formNote}>
                Status publikasi dan jadwal ini hanya simulasi; belum ada pengiriman ke katalog pengguna.
              </p>
              <div className={styles.dialogActions}>
                <button type="button" className={styles.cancelButton} onClick={onCloseForm}>
                  Batal
                </button>
                <button type="submit" className={styles.createButton}>
                  {formMode === 'create' ? 'Simpan Pengumuman' : 'Simpan Perubahan'}
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
          <section
            className={styles.dialog}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-announcement-title"
          >
            <div className={styles.dialogHeading}>
              <div>
                <h2 id="delete-announcement-title">Hapus pengumuman {deleteTarget.title}?</h2>
                <p>Pengumuman akan dihapus dari daftar pada sesi ini.</p>
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
                <IconTrash /> Hapus Pengumuman
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
};
