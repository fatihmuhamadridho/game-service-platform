'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Box } from 'rangkaui';
import { IconEdit, IconFileText, IconPlus, IconSearch, IconTrash, IconX } from '@tabler/icons-react';
import { AdminHeader } from '@common-ui/organisms/AdminDashboard/AdminHeader';
import { AdminSidebar } from '@common-ui/organisms/AdminDashboard/AdminSidebar';
import type {
  AdminPageForm,
  AdminPageFormMode,
  AdminPageStatus,
  AdminPageStatusFilter,
  AdminPageView,
} from '../interfaces/admin-page.interface';
import styles from '../pages/AdminPages.module.css';

type Props = {
  pages: AdminPageView[];
  filteredPages: AdminPageView[];
  query: string;
  onQueryChange: (value: string) => void;
  statusFilter: AdminPageStatusFilter;
  onStatusFilterChange: (value: AdminPageStatusFilter) => void;
  publishedCount: number;
  formMode: AdminPageFormMode;
  form: AdminPageForm;
  onFormChange: (updater: (current: AdminPageForm) => AdminPageForm) => void;
  onCreate: () => void;
  onEdit: (page: AdminPageView) => void;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
  onCloseForm: () => void;
  deleteTarget: AdminPageView | null;
  onDeleteSelect: (page: AdminPageView | null) => void;
  onDeleteConfirm: () => void;
};

export const AdminPagesTemplate = ({
  pages,
  filteredPages,
  query,
  onQueryChange,
  statusFilter,
  onStatusFilterChange,
  publishedCount,
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
  const updateField = <K extends keyof AdminPageForm>(field: K, value: AdminPageForm[K]) =>
    onFormChange((current) => ({ ...current, [field]: value }));
  const slugify = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s-]+/g, '-');

  return (
    <main className={styles.page}>
      <AdminHeader query={query} onQueryChange={onQueryChange} onMenuOpen={() => setMenuOpen(true)} />
      <AdminSidebar open={menuOpen} onClose={() => setMenuOpen(false)} activeItem="Halaman" />
      <div className={styles.main}>
        <div className={styles.heading}>
          <div>
            <p className={styles.breadcrumb}>
              Dashboard <span>/</span> Konten <span>/</span> <b>Halaman</b>
            </p>
            <h1>Kelola Halaman</h1>
            <p>Atur halaman informasi dan kebijakan yang tersedia di JokiHub.</p>
          </div>
          <button className={styles.createButton} onClick={onCreate}>
            <IconPlus /> Buat Halaman
          </button>
        </div>
        <section className={styles.metrics} aria-label="Ringkasan halaman">
          <Box className={styles.metric} bordered rounded>
            <span>Total Halaman</span>
            <b>{pages.length}</b>
          </Box>
          <Box className={styles.metric} bordered rounded>
            <span>Published</span>
            <b className={styles.publishedValue}>{publishedCount}</b>
          </Box>
          <Box className={styles.metric} bordered rounded>
            <span>Draft</span>
            <b className={styles.draftValue}>{pages.length - publishedCount}</b>
          </Box>
        </section>
        <Box className={styles.panel} bordered rounded>
          <div className={styles.toolbar}>
            <div>
              <h2>Daftar Halaman</h2>
              <small>{filteredPages.length} halaman ditampilkan</small>
            </div>
            <div className={styles.controls}>
              <label className={styles.search}>
                <IconSearch />
                <input
                  value={query}
                  onChange={(event) => onQueryChange(event.target.value)}
                  placeholder="Cari judul atau slug..."
                  aria-label="Cari halaman"
                />
              </label>
              <label className={styles.filter}>
                <span className={styles.visuallyHidden}>Filter status</span>
                <select
                  value={statusFilter}
                  onChange={(event) => onStatusFilterChange(event.target.value as AdminPageStatusFilter)}
                >
                  <option>Semua Status</option>
                  <option>Published</option>
                  <option>Draft</option>
                </select>
              </label>
            </div>
          </div>
          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>Halaman</th>
                  <th>Slug</th>
                  <th>Status</th>
                  <th>Terakhir Diubah</th>
                  <th>
                    <span className={styles.visuallyHidden}>Aksi</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPages.map((page) => (
                  <tr key={page.id}>
                    <td>
                      <span className={styles.pageCell}>
                        <i>
                          <IconFileText />
                        </i>
                        <span>
                          <b>{page.title}</b>
                          <small>{page.summary}</small>
                        </span>
                      </span>
                    </td>
                    <td>
                      <code>/{page.slug}</code>
                    </td>
                    <td>
                      <span
                        className={`${styles.status} ${page.status === 'Published' ? styles.statusPublished : styles.statusDraft}`}
                      >
                        <i />
                        {page.status}
                      </span>
                    </td>
                    <td>{page.updatedAt}</td>
                    <td>
                      <div className={styles.rowActions}>
                        <button aria-label={`Edit ${page.title}`} onClick={() => onEdit(page)}>
                          <IconEdit /> Edit
                        </button>
                        <button
                          className={styles.deleteButton}
                          aria-label={`Hapus ${page.title}`}
                          onClick={() => onDeleteSelect(page)}
                        >
                          <IconTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!filteredPages.length && (
              <div className={styles.empty}>
                <IconFileText />
                <b>Halaman tidak ditemukan</b>
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
          <section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="page-dialog-title">
            <div className={styles.dialogHeading}>
              <div>
                <h2 id="page-dialog-title">{formMode === 'create' ? 'Buat Halaman' : 'Edit Halaman'}</h2>
                <p>Lengkapi konten halaman yang ingin dikelola.</p>
              </div>
              <button className={styles.closeButton} aria-label="Tutup" onClick={onCloseForm}>
                <IconX />
              </button>
            </div>
            <form onSubmit={onSave}>
              <label>
                Judul Halaman
                <input
                  required
                  autoFocus
                  value={form.title}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    updateField('title', event.target.value);
                    if (!form.slug || formMode === 'create') updateField('slug', slugify(event.target.value));
                  }}
                  placeholder="Contoh: Tentang Kami"
                />
              </label>
              <label>
                Slug
                <input
                  required
                  value={form.slug}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => updateField('slug', slugify(event.target.value))}
                  placeholder="tentang-kami"
                />
                <small className={styles.slugHint}>Alamat halaman: /{form.slug || 'slug-halaman'}</small>
              </label>
              <label>
                Ringkasan
                <input
                  required
                  value={form.summary}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => updateField('summary', event.target.value)}
                  placeholder="Ringkasan singkat halaman"
                />
              </label>
              <label>
                Isi Halaman
                <textarea
                  required
                  rows={7}
                  value={form.content}
                  onChange={(event: ChangeEvent<HTMLTextAreaElement>) => updateField('content', event.target.value)}
                  placeholder="Tulis isi halaman..."
                />
              </label>
              <label>
                Status
                <select
                  value={form.status}
                  onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                    updateField('status', event.target.value as AdminPageStatus)
                  }
                >
                  <option>Draft</option>
                  <option>Published</option>
                </select>
              </label>
              <p className={styles.formNote}>
                Status publikasi hanya simulasi; halaman belum dipublikasikan ke storefront.
              </p>
              <div className={styles.dialogActions}>
                <button type="button" className={styles.cancelButton} onClick={onCloseForm}>
                  Batal
                </button>
                <button type="submit" className={styles.createButton}>
                  {formMode === 'create' ? 'Simpan Halaman' : 'Simpan Perubahan'}
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
          <section className={styles.dialog} role="alertdialog" aria-modal="true" aria-labelledby="delete-page-title">
            <div className={styles.dialogHeading}>
              <div>
                <h2 id="delete-page-title">Hapus halaman {deleteTarget.title}?</h2>
                <p>Halaman akan dihapus dari daftar pada sesi ini.</p>
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
                <IconTrash /> Hapus Halaman
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
};
