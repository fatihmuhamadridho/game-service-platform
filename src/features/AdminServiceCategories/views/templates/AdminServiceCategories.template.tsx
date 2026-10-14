'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Box } from 'rangkaui';
import { IconEdit, IconPlus, IconSearch, IconTag, IconTrash, IconX } from '@tabler/icons-react';
import { AdminHeader } from '@common-ui/organisms/AdminDashboard/AdminHeader';
import { AdminSidebar } from '@common-ui/organisms/AdminDashboard/AdminSidebar';
import type {
  AdminServiceCategoryForm,
  AdminServiceCategoryFormMode,
  AdminServiceCategoryStatusFilter,
  AdminServiceCategoryView,
} from '../interfaces/admin-service-category.interface';
import styles from '../pages/AdminServiceCategories.module.css';

type Props = {
  categories: AdminServiceCategoryView[];
  error?: string;
  filteredCategories: AdminServiceCategoryView[];
  query: string;
  onQueryChange: (value: string) => void;
  statusFilter: AdminServiceCategoryStatusFilter;
  onStatusFilterChange: (value: AdminServiceCategoryStatusFilter) => void;
  activeCount: number;
  formMode: AdminServiceCategoryFormMode;
  form: AdminServiceCategoryForm;
  onFormChange: (updater: (current: AdminServiceCategoryForm) => AdminServiceCategoryForm) => void;
  onCreate: () => void;
  onEdit: (category: AdminServiceCategoryView) => void;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
  onCloseForm: () => void;
  deleteTarget: AdminServiceCategoryView | null;
  onDeleteSelect: (category: AdminServiceCategoryView | null) => void;
  onDeleteConfirm: () => void;
};

export const AdminServiceCategoriesTemplate = ({
  categories,
  error = '',
  filteredCategories,
  query,
  onQueryChange,
  statusFilter,
  onStatusFilterChange,
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
  const updateField = <K extends keyof AdminServiceCategoryForm>(field: K, value: AdminServiceCategoryForm[K]) =>
    onFormChange((current) => ({ ...current, [field]: value }));
  const updateName = (value: string) =>
    onFormChange((current) => {
      const currentSlug = current.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      return {
        ...current,
        name: value,
        slug:
          !current.slug || current.slug === currentSlug
            ? value
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '')
            : current.slug,
      };
    });

  return (
    <main className={styles.page}>
      <AdminHeader query={query} onQueryChange={onQueryChange} onMenuOpen={() => setMenuOpen(true)} />
      <AdminSidebar open={menuOpen} onClose={() => setMenuOpen(false)} activeItem="Kategori Layanan" />
      <div className={styles.main}>
        <div className={styles.heading}>
          <div>
            <p className={styles.breadcrumb}>
              Dashboard <span>/</span> Produk &amp; Layanan <span>/</span> <b>Kategori Layanan</b>
            </p>
            <h1>Kelola Kategori Layanan</h1>
            <p>Atur kategori untuk mengelompokkan layanan game.</p>
          </div>
          <button className={styles.createButton} onClick={onCreate}>
            <IconPlus /> Tambah Kategori
          </button>
        </div>

        <section className={styles.metrics} aria-label="Ringkasan kategori">
          <Box className={styles.metric} bordered rounded>
            <span>Total Kategori</span>
            <b>{categories.length}</b>
          </Box>
          <Box className={styles.metric} bordered rounded>
            <span>Kategori Aktif</span>
            <b className={styles.activeValue}>{activeCount}</b>
          </Box>
          <Box className={styles.metric} bordered rounded>
            <span>Kategori Nonaktif</span>
            <b className={styles.inactiveValue}>{categories.length - activeCount}</b>
          </Box>
        </section>

        <Box className={styles.panel} bordered rounded>
          <div className={styles.toolbar}>
            <div>
              <h2>Daftar Kategori</h2>
              <small>{filteredCategories.length} kategori ditampilkan</small>
            </div>
            <div className={styles.controls}>
              <label className={styles.search}>
                <IconSearch />
                <input
                  value={query}
                  onChange={(event) => onQueryChange(event.target.value)}
                  placeholder="Cari nama atau slug kategori..."
                  aria-label="Cari kategori layanan"
                />
              </label>
              <label className={styles.filter}>
                <span className={styles.visuallyHidden}>Filter status</span>
                <select
                  value={statusFilter}
                  onChange={(event) => onStatusFilterChange(event.target.value as AdminServiceCategoryStatusFilter)}
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
                  <th>Kategori</th>
                  <th>Slug</th>
                  <th>Jumlah Layanan</th>
                  <th>Status</th>
                  <th>Terakhir Diubah</th>
                  <th>
                    <span className={styles.visuallyHidden}>Aksi</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((category) => (
                  <tr key={category.id}>
                    <td>
                      <span className={styles.categoryName}>
                        <i>
                          <IconTag />
                        </i>
                        <span>
                          <b>{category.name}</b>
                          <small>{category.description}</small>
                        </span>
                      </span>
                    </td>
                    <td>
                      <code>{category.slug}</code>
                    </td>
                    <td>{category.serviceCount} layanan</td>
                    <td>
                      <span
                        className={`${styles.status} ${category.active ? styles.statusActive : styles.statusInactive}`}
                      >
                        <i />
                        {category.active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td>{category.updatedAt}</td>
                    <td>
                      <div className={styles.rowActions}>
                        <button aria-label={`Edit kategori ${category.name}`} onClick={() => onEdit(category)}>
                          <IconEdit /> Edit
                        </button>
                        <button
                          className={styles.deleteButton}
                          aria-label={`Hapus kategori ${category.name}`}
                          onClick={() => onDeleteSelect(category)}
                        >
                          <IconTrash /> Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!filteredCategories.length && (
              <div className={styles.empty}>
                <IconTag />
                <b>Kategori tidak ditemukan</b>
                <span>Coba kata kunci atau filter status lain.</span>
              </div>
            )}
          </div>
          {error && (
            <p role="alert" className={styles.demoNote}>
              {error}
            </p>
          )}
        </Box>
      </div>

      {formMode && (
        <div
          className={styles.overlay}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onCloseForm();
          }}
        >
          <section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="category-dialog-title">
            <div className={styles.dialogHeading}>
              <div>
                <h2 id="category-dialog-title">{formMode === 'create' ? 'Tambah Kategori' : 'Edit Kategori'}</h2>
                <p>Lengkapi informasi kategori layanan.</p>
              </div>
              <button className={styles.closeButton} aria-label="Tutup" onClick={onCloseForm}>
                <IconX />
              </button>
            </div>
            <form onSubmit={onSave}>
              <label>
                Nama Kategori
                <input
                  required
                  autoFocus
                  value={form.name}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => updateName(event.target.value)}
                  placeholder="Contoh: Top Up"
                />
              </label>
              <label>
                Slug
                <input
                  required
                  value={form.slug}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    updateField(
                      'slug',
                      event.target.value
                        .toLowerCase()
                        .trim()
                        .replace(/[^a-z0-9-]+/g, '-')
                    )
                  }
                  placeholder="top-up"
                />
              </label>
              <label>
                Deskripsi
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(event: ChangeEvent<HTMLTextAreaElement>) => updateField('description', event.target.value)}
                  placeholder="Jelaskan jenis layanan dalam kategori ini"
                />
              </label>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => updateField('active', event.target.checked)}
                />
                <span>Kategori aktif dan tampil di katalog</span>
              </label>
              {error && (
                <p role="alert" className={styles.formNote}>
                  {error}
                </p>
              )}
              <div className={styles.dialogActions}>
                <button type="button" className={styles.cancelButton} onClick={onCloseForm}>
                  Batal
                </button>
                <button type="submit" className={styles.createButton}>
                  {formMode === 'create' ? 'Simpan Kategori' : 'Simpan Perubahan'}
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
            aria-labelledby="delete-category-title"
          >
            <div className={styles.dialogHeading}>
              <div>
                <h2 id="delete-category-title">Hapus kategori {deleteTarget.name}?</h2>
                <p>Kategori dihapus bila belum digunakan layanan.</p>
              </div>
              <button className={styles.closeButton} aria-label="Tutup" onClick={() => onDeleteSelect(null)}>
                <IconX />
              </button>
            </div>
            <div className={styles.dialogActions}>
              {error && (
                <p role="alert" className={styles.formNote}>
                  {error}
                </p>
              )}
              <button className={styles.cancelButton} onClick={() => onDeleteSelect(null)}>
                Batal
              </button>
              <button className={`${styles.createButton} ${styles.confirmDelete}`} onClick={onDeleteConfirm}>
                <IconTrash /> Hapus Kategori
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
};
