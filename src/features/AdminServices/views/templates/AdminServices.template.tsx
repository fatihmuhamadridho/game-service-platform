'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Box } from 'rangkaui';
import { IconDeviceGamepad2, IconEdit, IconPlus, IconSearch, IconTrash, IconX } from '@tabler/icons-react';
import { AdminHeader } from '@common-ui/organisms/AdminDashboard/AdminHeader';
import { AdminSidebar } from '@common-ui/organisms/AdminDashboard/AdminSidebar';
import type {
  AdminServiceForm,
  AdminServiceFormMode,
  AdminServiceStatusFilter,
  AdminServiceView,
} from '../interfaces/admin-service.interface';
import styles from '../pages/AdminServices.module.css';

type Props = {
  services: AdminServiceView[];
  filteredServices: AdminServiceView[];
  games: string[];
  categories: string[];
  query: string;
  onQueryChange: (value: string) => void;
  statusFilter: AdminServiceStatusFilter;
  onStatusFilterChange: (value: AdminServiceStatusFilter) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  activeCount: number;
  customPriceCount: number;
  formMode: AdminServiceFormMode;
  form: AdminServiceForm;
  onFormChange: (updater: (current: AdminServiceForm) => AdminServiceForm) => void;
  onCreate: () => void;
  onEdit: (service: AdminServiceView) => void;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
  onCloseForm: () => void;
  deleteTarget: AdminServiceView | null;
  onDeleteSelect: (service: AdminServiceView | null) => void;
  onDeleteConfirm: () => void;
};

const formatPrice = (price: number) => `Rp ${price.toLocaleString('id-ID')}`;

export const AdminServicesTemplate = ({
  services,
  filteredServices,
  games,
  categories,
  query,
  onQueryChange,
  statusFilter,
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  activeCount,
  customPriceCount,
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
  const updateField = <K extends keyof AdminServiceForm>(field: K, value: AdminServiceForm[K]) =>
    onFormChange((current) => ({ ...current, [field]: value }));

  return (
    <main className={styles.page}>
      <AdminHeader query={query} onQueryChange={onQueryChange} onMenuOpen={() => setMenuOpen(true)} />
      <AdminSidebar open={menuOpen} onClose={() => setMenuOpen(false)} activeItem="Layanan" />
      <div className={styles.main}>
        <div className={styles.heading}>
          <div>
            <p className={styles.breadcrumb}>
              Dashboard <span>/</span> Produk &amp; Layanan <span>/</span> <b>Layanan</b>
            </p>
            <h1>Kelola Layanan</h1>
            <p>Atur produk layanan, harga, estimasi, dan status publikasi.</p>
          </div>
          <button className={styles.createButton} onClick={onCreate}>
            <IconPlus /> Tambah Layanan
          </button>
        </div>

        <section className={styles.metrics} aria-label="Ringkasan layanan">
          <Box className={styles.metric} bordered rounded>
            <span>Total Layanan</span>
            <b>{services.length}</b>
          </Box>
          <Box className={styles.metric} bordered rounded>
            <span>Layanan Aktif</span>
            <b className={styles.activeValue}>{activeCount}</b>
          </Box>
          <Box className={styles.metric} bordered rounded>
            <span>Harga Custom</span>
            <b className={styles.customValue}>{customPriceCount}</b>
          </Box>
        </section>

        <Box className={styles.panel} bordered rounded>
          <div className={styles.toolbar}>
            <div>
              <h2>Daftar Layanan</h2>
              <small>{filteredServices.length} layanan ditampilkan</small>
            </div>
            <div className={styles.controls}>
              <label className={styles.search}>
                <IconSearch />
                <input
                  value={query}
                  onChange={(event) => onQueryChange(event.target.value)}
                  placeholder="Cari layanan, game..."
                  aria-label="Cari layanan"
                />
              </label>
              <label className={styles.filter}>
                <span className={styles.visuallyHidden}>Filter kategori</span>
                <select value={categoryFilter} onChange={(event) => onCategoryFilterChange(event.target.value)}>
                  <option>Semua Kategori</option>
                  {categories.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
              </label>
              <label className={styles.filter}>
                <span className={styles.visuallyHidden}>Filter status</span>
                <select
                  value={statusFilter}
                  onChange={(event) => onStatusFilterChange(event.target.value as AdminServiceStatusFilter)}
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
                  <th>Layanan</th>
                  <th>Game</th>
                  <th>Kategori</th>
                  <th>Harga</th>
                  <th>Estimasi</th>
                  <th>Status</th>
                  <th>
                    <span className={styles.visuallyHidden}>Aksi</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.map((service) => (
                  <tr key={service.id}>
                    <td>
                      <span className={styles.serviceName}>
                        <i>
                          <IconDeviceGamepad2 />
                        </i>
                        <b>{service.name}</b>
                      </span>
                    </td>
                    <td>{service.game}</td>
                    <td>
                      <span className={styles.category}>{service.category}</span>
                    </td>
                    <td>
                      {service.price === null ? (
                        <span className={styles.customPrice}>Hubungi Admin</span>
                      ) : (
                        formatPrice(service.price)
                      )}
                    </td>
                    <td>{service.estimate}</td>
                    <td>
                      <span
                        className={`${styles.status} ${service.active ? styles.statusActive : styles.statusInactive}`}
                      >
                        <i />
                        {service.active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td>
                      <div className={styles.rowActions}>
                        <button aria-label={`Edit ${service.name}`} onClick={() => onEdit(service)}>
                          <IconEdit /> Edit
                        </button>
                        <button
                          className={styles.deleteButton}
                          aria-label={`Hapus ${service.name}`}
                          onClick={() => onDeleteSelect(service)}
                        >
                          <IconTrash /> Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!filteredServices.length && (
              <div className={styles.empty}>
                <IconDeviceGamepad2 />
                <b>Layanan tidak ditemukan</b>
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
          <section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="service-dialog-title">
            <div className={styles.dialogHeading}>
              <div>
                <h2 id="service-dialog-title">{formMode === 'create' ? 'Tambah Layanan' : 'Edit Layanan'}</h2>
                <p>Lengkapi informasi layanan di bawah.</p>
              </div>
              <button className={styles.closeButton} aria-label="Tutup" onClick={onCloseForm}>
                <IconX />
              </button>
            </div>
            <form onSubmit={onSave}>
              <label>
                Nama Layanan
                <input
                  required
                  autoFocus
                  value={form.name}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => updateField('name', event.target.value)}
                  placeholder="Contoh: Top Up Diamond 100"
                />
              </label>
              <div className={styles.formRow}>
                <label>
                  Game
                  <select
                    value={form.game}
                    onChange={(event: ChangeEvent<HTMLSelectElement>) => updateField('game', event.target.value)}
                  >
                    {games.map((game) => (
                      <option key={game}>{game}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Kategori
                  <select
                    value={form.category}
                    onChange={(event: ChangeEvent<HTMLSelectElement>) => updateField('category', event.target.value)}
                  >
                    {categories.map((category) => (
                      <option key={category}>{category}</option>
                    ))}
                  </select>
                </label>
              </div>
              <div className={styles.formRow}>
                <label>
                  Harga (Rp)
                  <input
                    type="number"
                    min="0"
                    step="500"
                    disabled={form.price === null}
                    value={form.price ?? ''}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      updateField('price', event.target.value === '' ? null : Number(event.target.value))
                    }
                    placeholder="Contoh: 25000"
                  />
                </label>
                <label>
                  Estimasi
                  <input
                    required
                    value={form.estimate}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => updateField('estimate', event.target.value)}
                    placeholder="Contoh: 1–2 hari"
                  />
                </label>
              </div>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={form.price === null}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    updateField('price', event.target.checked ? null : 0)
                  }
                />
                <span>Harga custom, perlu konfirmasi admin</span>
              </label>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => updateField('active', event.target.checked)}
                />
                <span>Layanan aktif dan tampil di katalog</span>
              </label>
              <div className={styles.dialogActions}>
                <button type="button" className={styles.cancelButton} onClick={onCloseForm}>
                  Batal
                </button>
                <button type="submit" className={styles.createButton}>
                  {formMode === 'create' ? 'Simpan Layanan' : 'Simpan Perubahan'}
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
            aria-labelledby="delete-service-title"
          >
            <div className={styles.dialogHeading}>
              <div>
                <h2 id="delete-service-title">Hapus layanan {deleteTarget.name}?</h2>
                <p>Layanan akan dihapus dari daftar pada sesi ini.</p>
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
                <IconTrash /> Hapus Layanan
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
};
