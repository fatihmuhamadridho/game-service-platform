'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Box } from 'rangkaui';
import { IconEdit, IconEye, IconPlus, IconSearch, IconShield, IconTrash, IconX } from '@tabler/icons-react';
import { AdminHeader } from '@common-ui/organisms/AdminDashboard/AdminHeader';
import { AdminSidebar } from '@common-ui/organisms/AdminDashboard/AdminSidebar';
import type {
  AdminAccountForm,
  AdminAccountFormMode,
  AdminAccountRole,
  AdminAccountRoleFilter,
  AdminAccountStatus,
  AdminAccountStatusFilter,
  AdminAccountView,
} from '../interfaces/admin-account.interface';
import styles from '../pages/AdminManagement.module.css';

type Props = {
  admins: AdminAccountView[];
  filteredAdmins: AdminAccountView[];
  query: string;
  onQueryChange: (value: string) => void;
  roleFilter: AdminAccountRoleFilter;
  onRoleFilterChange: (value: AdminAccountRoleFilter) => void;
  statusFilter: AdminAccountStatusFilter;
  onStatusFilterChange: (value: AdminAccountStatusFilter) => void;
  activeCount: number;
  superAdminCount: number;
  formMode: AdminAccountFormMode;
  form: AdminAccountForm;
  onFormChange: (updater: (current: AdminAccountForm) => AdminAccountForm) => void;
  onCreate: () => void;
  onEdit: (admin: AdminAccountView) => void;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
  onCloseForm: () => void;
  deleteTarget: AdminAccountView | null;
  onDeleteSelect: (admin: AdminAccountView | null) => void;
  onDeleteConfirm: () => void;
  viewTarget: AdminAccountView | null;
  onView: (admin: AdminAccountView | null) => void;
};

export const AdminManagementTemplate = ({
  admins,
  filteredAdmins,
  query,
  onQueryChange,
  roleFilter,
  onRoleFilterChange,
  statusFilter,
  onStatusFilterChange,
  activeCount,
  superAdminCount,
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
  viewTarget,
  onView,
}: Props) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const updateField = <K extends keyof AdminAccountForm>(field: K, value: AdminAccountForm[K]) =>
    onFormChange((current) => ({ ...current, [field]: value }));
  const initials = (name: string) =>
    name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
  const deletingLastSuperAdmin = Boolean(deleteTarget?.role === 'Super Admin' && superAdminCount <= 1);

  return (
    <main className={styles.page}>
      <AdminHeader query={query} onQueryChange={onQueryChange} onMenuOpen={() => setMenuOpen(true)} />
      <AdminSidebar open={menuOpen} onClose={() => setMenuOpen(false)} activeItem="Admin" />
      <div className={styles.main}>
        <div className={styles.heading}>
          <div>
            <p className={styles.breadcrumb}>
              Dashboard <span>/</span> Pengguna <span>/</span> <b>Admin</b>
            </p>
            <h1>Manajemen Admin</h1>
            <p>Atur akun admin dan akses pengelolaan JokiHub.</p>
          </div>
          <button className={styles.createButton} onClick={onCreate}>
            <IconPlus /> Tambah Admin
          </button>
        </div>

        <section className={styles.metrics} aria-label="Ringkasan admin">
          <Box className={styles.metric} bordered rounded>
            <span>Total Admin</span>
            <b>{admins.length}</b>
          </Box>
          <Box className={styles.metric} bordered rounded>
            <span>Admin Aktif</span>
            <b className={styles.activeValue}>{activeCount}</b>
          </Box>
          <Box className={styles.metric} bordered rounded>
            <span>Super Admin</span>
            <b className={styles.superValue}>{superAdminCount}</b>
          </Box>
        </section>

        <Box className={styles.panel} bordered rounded>
          <div className={styles.toolbar}>
            <div>
              <h2>Daftar Admin</h2>
              <small>{filteredAdmins.length} admin ditampilkan</small>
            </div>
            <div className={styles.controls}>
              <label className={styles.search}>
                <IconSearch />
                <input
                  value={query}
                  onChange={(event) => onQueryChange(event.target.value)}
                  placeholder="Cari nama atau email admin..."
                  aria-label="Cari admin"
                />
              </label>
              <label className={styles.filter}>
                <span className={styles.visuallyHidden}>Filter role</span>
                <select
                  value={roleFilter}
                  onChange={(event) => onRoleFilterChange(event.target.value as AdminAccountRoleFilter)}
                >
                  <option>Semua Role</option>
                  <option>Admin</option>
                  <option>Super Admin</option>
                </select>
              </label>
              <label className={styles.filter}>
                <span className={styles.visuallyHidden}>Filter status</span>
                <select
                  value={statusFilter}
                  onChange={(event) => onStatusFilterChange(event.target.value as AdminAccountStatusFilter)}
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
                  <th>Admin</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Aktivitas Terakhir</th>
                  <th>
                    <span className={styles.visuallyHidden}>Aksi</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAdmins.map((admin) => (
                  <tr key={admin.id}>
                    <td>
                      <span className={styles.adminCell}>
                        <i>{initials(admin.name)}</i>
                        <span>
                          <b>{admin.name}</b>
                          <small>{admin.email}</small>
                        </span>
                      </span>
                    </td>
                    <td>
                      <span
                        className={`${styles.role} ${admin.role === 'Super Admin' ? styles.superRole : styles.adminRole}`}
                      >
                        <IconShield />
                        {admin.role}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`${styles.status} ${admin.status === 'Aktif' ? styles.statusActive : styles.statusInactive}`}
                      >
                        <i />
                        {admin.status}
                      </span>
                    </td>
                    <td>{admin.lastActive}</td>
                    <td>
                      <div className={styles.rowActions}>
                        <button aria-label={`Lihat ${admin.name}`} onClick={() => onView(admin)}>
                          <IconEye /> Detail
                        </button>
                        <button aria-label={`Edit ${admin.name}`} onClick={() => onEdit(admin)}>
                          <IconEdit /> Edit
                        </button>
                        <button
                          className={styles.deleteButton}
                          aria-label={`Hapus ${admin.name}`}
                          onClick={() => onDeleteSelect(admin)}
                        >
                          <IconTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!filteredAdmins.length && (
              <div className={styles.empty}>
                <IconShield />
                <b>Admin tidak ditemukan</b>
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
          <section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="admin-dialog-title">
            <div className={styles.dialogHeading}>
              <div>
                <h2 id="admin-dialog-title">{formMode === 'create' ? 'Tambah Admin' : 'Edit Admin'}</h2>
                <p>Atur identitas, role, dan status admin.</p>
              </div>
              <button className={styles.closeButton} aria-label="Tutup" onClick={onCloseForm}>
                <IconX />
              </button>
            </div>
            <form onSubmit={onSave}>
              <label>
                Nama Lengkap
                <input
                  required
                  autoFocus
                  value={form.name}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => updateField('name', event.target.value)}
                  placeholder="Nama admin"
                />
              </label>
              <label>
                Email
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => updateField('email', event.target.value)}
                  placeholder="nama@example.com"
                />
              </label>
              <div className={styles.formRow}>
                <label>
                  Role
                  <select
                    value={form.role}
                    onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                      updateField('role', event.target.value as AdminAccountRole)
                    }
                  >
                    <option>Admin</option>
                    <option>Super Admin</option>
                  </select>
                </label>
                <label>
                  Status
                  <select
                    value={form.status}
                    onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                      updateField('status', event.target.value as AdminAccountStatus)
                    }
                  >
                    <option>Aktif</option>
                    <option>Nonaktif</option>
                  </select>
                </label>
              </div>
              <p className={styles.formNote}>Prototipe UI belum mengirim undangan atau mengubah hak akses di server.</p>
              <div className={styles.dialogActions}>
                <button type="button" className={styles.cancelButton} onClick={onCloseForm}>
                  Batal
                </button>
                <button type="submit" className={styles.createButton}>
                  {formMode === 'create' ? 'Simpan Admin' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {viewTarget && (
        <div
          className={styles.overlay}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onView(null);
          }}
        >
          <section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="admin-detail-title">
            <div className={styles.dialogHeading}>
              <div>
                <h2 id="admin-detail-title">Detail Admin</h2>
                <p>Informasi akun admin.</p>
              </div>
              <button className={styles.closeButton} aria-label="Tutup" onClick={() => onView(null)}>
                <IconX />
              </button>
            </div>
            <div className={styles.detailAvatar}>{initials(viewTarget.name)}</div>
            <dl className={styles.details}>
              <div>
                <dt>Nama</dt>
                <dd>{viewTarget.name}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{viewTarget.email}</dd>
              </div>
              <div>
                <dt>Role</dt>
                <dd>{viewTarget.role}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{viewTarget.status}</dd>
              </div>
              <div>
                <dt>Aktivitas Terakhir</dt>
                <dd>{viewTarget.lastActive}</dd>
              </div>
            </dl>
            <div className={styles.dialogActions}>
              <button className={styles.cancelButton} onClick={() => onView(null)}>
                Tutup
              </button>
              <button
                className={styles.createButton}
                onClick={() => {
                  onView(null);
                  onEdit(viewTarget);
                }}
              >
                <IconEdit /> Edit Admin
              </button>
            </div>
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
          <section className={styles.dialog} role="alertdialog" aria-modal="true" aria-labelledby="delete-admin-title">
            <div className={styles.dialogHeading}>
              <div>
                <h2 id="delete-admin-title">Hapus admin {deleteTarget.name}?</h2>
                <p>
                  {deletingLastSuperAdmin
                    ? 'Super Admin terakhir tidak bisa dihapus.'
                    : 'Admin akan dihapus dari daftar pada sesi ini.'}
                </p>
              </div>
              <button className={styles.closeButton} aria-label="Tutup" onClick={() => onDeleteSelect(null)}>
                <IconX />
              </button>
            </div>
            <div className={styles.dialogActions}>
              <button className={styles.cancelButton} onClick={() => onDeleteSelect(null)}>
                Batal
              </button>
              <button
                className={`${styles.createButton} ${styles.confirmDelete}`}
                disabled={deletingLastSuperAdmin}
                onClick={onDeleteConfirm}
              >
                <IconTrash /> Hapus Admin
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
};
