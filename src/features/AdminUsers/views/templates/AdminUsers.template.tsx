'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Box } from 'rangkaui';
import { IconEdit, IconEye, IconPlus, IconSearch, IconTrash, IconUser, IconX } from '@tabler/icons-react';
import { AdminHeader } from '@common-ui/organisms/AdminDashboard/AdminHeader';
import { AdminSidebar } from '@common-ui/organisms/AdminDashboard/AdminSidebar';
import type {
  AdminUserForm,
  AdminUserFormMode,
  AdminUserRole,
  AdminUserRoleFilter,
  AdminUserStatus,
  AdminUserStatusFilter,
  AdminUserView,
} from '../interfaces/admin-user.interface';
import styles from '../pages/AdminUsers.module.css';

type Props = {
  users: AdminUserView[];
  filteredUsers: AdminUserView[];
  query: string;
  onQueryChange: (value: string) => void;
  statusFilter: AdminUserStatusFilter;
  onStatusFilterChange: (value: AdminUserStatusFilter) => void;
  roleFilter: AdminUserRoleFilter;
  onRoleFilterChange: (value: AdminUserRoleFilter) => void;
  activeCount: number;
  adminCount: number;
  formMode: AdminUserFormMode;
  form: AdminUserForm;
  onFormChange: (updater: (current: AdminUserForm) => AdminUserForm) => void;
  onCreate: () => void;
  onEdit: (user: AdminUserView) => void;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
  onCloseForm: () => void;
  deleteTarget: AdminUserView | null;
  onDeleteSelect: (user: AdminUserView | null) => void;
  onDeleteConfirm: () => void;
  viewTarget: AdminUserView | null;
  onView: (user: AdminUserView | null) => void;
};

export const AdminUsersTemplate = ({
  users,
  filteredUsers,
  query,
  onQueryChange,
  statusFilter,
  onStatusFilterChange,
  roleFilter,
  onRoleFilterChange,
  activeCount,
  adminCount,
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
  const updateField = <K extends keyof AdminUserForm>(field: K, value: AdminUserForm[K]) =>
    onFormChange((current) => ({ ...current, [field]: value }));
  const initials = (name: string) =>
    name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');

  return (
    <main className={styles.page}>
      <AdminHeader query={query} onQueryChange={onQueryChange} onMenuOpen={() => setMenuOpen(true)} />
      <AdminSidebar open={menuOpen} onClose={() => setMenuOpen(false)} activeItem="User" />
      <div className={styles.main}>
        <div className={styles.heading}>
          <div>
            <p className={styles.breadcrumb}>
              Dashboard <span>/</span> Pengguna <span>/</span> <b>User</b>
            </p>
            <h1>User Management</h1>
            <p>Kelola akun pengguna, role, dan status akses.</p>
          </div>
          <button className={styles.createButton} onClick={onCreate}>
            <IconPlus /> Tambah User
          </button>
        </div>

        <section className={styles.metrics} aria-label="Ringkasan user">
          <Box className={styles.metric} bordered rounded>
            <span>Total User</span>
            <b>{users.length}</b>
          </Box>
          <Box className={styles.metric} bordered rounded>
            <span>User Aktif</span>
            <b className={styles.activeValue}>{activeCount}</b>
          </Box>
          <Box className={styles.metric} bordered rounded>
            <span>Admin</span>
            <b className={styles.adminValue}>{adminCount}</b>
          </Box>
        </section>

        <Box className={styles.panel} bordered rounded>
          <div className={styles.toolbar}>
            <div>
              <h2>Daftar User</h2>
              <small>{filteredUsers.length} user ditampilkan</small>
            </div>
            <div className={styles.controls}>
              <label className={styles.search}>
                <IconSearch />
                <input
                  value={query}
                  onChange={(event) => onQueryChange(event.target.value)}
                  placeholder="Cari nama, username, email..."
                  aria-label="Cari user"
                />
              </label>
              <label className={styles.filter}>
                <span className={styles.visuallyHidden}>Filter role</span>
                <select
                  value={roleFilter}
                  onChange={(event) => onRoleFilterChange(event.target.value as AdminUserRoleFilter)}
                >
                  <option>Semua Role</option>
                  <option>Member</option>
                  <option>Admin</option>
                  <option>Super Admin</option>
                </select>
              </label>
              <label className={styles.filter}>
                <span className={styles.visuallyHidden}>Filter status</span>
                <select
                  value={statusFilter}
                  onChange={(event) => onStatusFilterChange(event.target.value as AdminUserStatusFilter)}
                >
                  <option>Semua</option>
                  <option>Aktif</option>
                  <option>Diblokir</option>
                </select>
              </label>
            </div>
          </div>
          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Bergabung</th>
                  <th>
                    <span className={styles.visuallyHidden}>Aksi</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <span className={styles.userCell}>
                        <i>{initials(user.name)}</i>
                        <span>
                          <b>{user.name}</b>
                          <small>{user.email}</small>
                        </span>
                      </span>
                    </td>
                    <td>@{user.username}</td>
                    <td>
                      <span className={`${styles.role} ${user.role === 'Member' ? '' : styles.adminRole}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`${styles.status} ${user.status === 'Aktif' ? styles.statusActive : styles.statusBlocked}`}
                      >
                        <i />
                        {user.status}
                      </span>
                    </td>
                    <td>{user.joinedAt}</td>
                    <td>
                      <div className={styles.rowActions}>
                        <button aria-label={`Lihat ${user.name}`} onClick={() => onView(user)}>
                          <IconEye /> Detail
                        </button>
                        <button aria-label={`Edit ${user.name}`} onClick={() => onEdit(user)}>
                          <IconEdit /> Edit
                        </button>
                        <button
                          className={styles.deleteButton}
                          aria-label={`Hapus ${user.name}`}
                          onClick={() => onDeleteSelect(user)}
                        >
                          <IconTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!filteredUsers.length && (
              <div className={styles.empty}>
                <IconUser />
                <b>User tidak ditemukan</b>
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
          <section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="user-dialog-title">
            <div className={styles.dialogHeading}>
              <div>
                <h2 id="user-dialog-title">{formMode === 'create' ? 'Tambah User' : 'Edit User'}</h2>
                <p>Atur informasi akun dan akses pengguna.</p>
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
                  placeholder="Nama user"
                />
              </label>
              <label>
                Username
                <input
                  required
                  value={form.username}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    updateField('username', event.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''))
                  }
                  placeholder="username"
                />
              </label>
              <label>
                Email
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => updateField('email', event.target.value)}
                  placeholder="nama@email.com"
                />
              </label>
              <div className={styles.formRow}>
                <label>
                  Role
                  <select
                    value={form.role}
                    onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                      updateField('role', event.target.value as AdminUserRole)
                    }
                  >
                    <option>Member</option>
                    <option>Admin</option>
                    <option>Super Admin</option>
                  </select>
                </label>
                <label>
                  Status
                  <select
                    value={form.status}
                    onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                      updateField('status', event.target.value as AdminUserStatus)
                    }
                  >
                    <option>Aktif</option>
                    <option>Diblokir</option>
                  </select>
                </label>
              </div>
              <div className={styles.dialogActions}>
                <button type="button" className={styles.cancelButton} onClick={onCloseForm}>
                  Batal
                </button>
                <button type="submit" className={styles.createButton}>
                  {formMode === 'create' ? 'Simpan User' : 'Simpan Perubahan'}
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
          <section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="user-detail-title">
            <div className={styles.dialogHeading}>
              <div>
                <h2 id="user-detail-title">Detail User</h2>
                <p>Informasi akun pengguna.</p>
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
                <dt>Username</dt>
                <dd>@{viewTarget.username}</dd>
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
                <dt>Bergabung</dt>
                <dd>{viewTarget.joinedAt}</dd>
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
                <IconEdit /> Edit User
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
          <section className={styles.dialog} role="alertdialog" aria-modal="true" aria-labelledby="delete-user-title">
            <div className={styles.dialogHeading}>
              <div>
                <h2 id="delete-user-title">Hapus user {deleteTarget.username}?</h2>
                <p>User akan dihapus dari daftar pada sesi ini.</p>
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
                <IconTrash /> Hapus User
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
};
