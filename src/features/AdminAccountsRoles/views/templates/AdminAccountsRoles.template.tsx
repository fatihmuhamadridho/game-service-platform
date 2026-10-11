'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Box } from 'rangkaui';
import {
  IconEdit,
  IconPlus,
  IconSearch,
  IconShield,
  IconTrash,
  IconUsers,
  IconX,
  IconDeviceFloppy,
} from '@tabler/icons-react';
import { AdminHeader } from '@common-ui/organisms/AdminDashboard/AdminHeader';
import { AdminSidebar } from '@common-ui/organisms/AdminDashboard/AdminSidebar';
import type {
  Permission,
  PermissionKey,
  RoleForm,
  RoleFormMode,
  RoleView,
} from '../interfaces/admin-accounts-roles.interface';
import styles from '../pages/AdminAccountsRoles.module.css';

type Props = {
  roles: RoleView[];
  filteredRoles: RoleView[];
  permissions: Permission[];
  query: string;
  onQueryChange: (value: string) => void;
  formMode: RoleFormMode;
  form: RoleForm;
  onFormChange: (updater: (current: RoleForm) => RoleForm) => void;
  onPermissionToggle: (key: PermissionKey) => void;
  onCreate: () => void;
  onEdit: (role: RoleView) => void;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
  onCloseForm: () => void;
  deleteTarget: RoleView | null;
  onDeleteSelect: (role: RoleView | null) => void;
  onDeleteConfirm: () => void;
  onSaveChanges: () => void;
  saved: boolean;
};

export const AdminAccountsRolesTemplate = ({
  roles,
  filteredRoles,
  permissions,
  query,
  onQueryChange,
  formMode,
  form,
  onFormChange,
  onPermissionToggle,
  onCreate,
  onEdit,
  onSave,
  onCloseForm,
  deleteTarget,
  onDeleteSelect,
  onDeleteConfirm,
  onSaveChanges,
  saved,
}: Props) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const updateField = <K extends keyof RoleForm>(field: K, value: RoleForm[K]) =>
    onFormChange((current) => ({ ...current, [field]: value }));
  return (
    <main className={styles.page}>
      <AdminHeader query={query} onQueryChange={onQueryChange} onMenuOpen={() => setMenuOpen(true)} />
      <AdminSidebar open={menuOpen} onClose={() => setMenuOpen(false)} activeItem="Akun & Role" />
      <div className={styles.main}>
        <div className={styles.heading}>
          <div>
            <p className={styles.breadcrumb}>
              Dashboard <span>/</span> Pengaturan <span>/</span> <b>Akun & Role</b>
            </p>
            <h1>Akun & Role</h1>
            <p>Kelola role admin dan izin akses ke area dashboard.</p>
          </div>
          <button className={styles.createButton} onClick={onCreate}>
            <IconPlus /> Buat Role
          </button>
        </div>
        <section className={styles.metrics} aria-label="Ringkasan role">
          <Box className={styles.metric} bordered rounded>
            <span>Total Role</span>
            <b>{roles.length}</b>
          </Box>
          <Box className={styles.metric} bordered rounded>
            <span>Total Admin Terhubung</span>
            <b className={styles.accentValue}>{roles.reduce((sum, role) => sum + role.adminCount, 0)}</b>
          </Box>
          <Box className={styles.metric} bordered rounded>
            <span>Area Akses</span>
            <b>{permissions.length}</b>
          </Box>
        </section>
        <Box className={styles.panel} bordered rounded>
          <div className={styles.toolbar}>
            <div>
              <h2>Daftar Role</h2>
              <small>Role mengatur izin yang dimiliki akun admin.</small>
            </div>
            <label className={styles.search}>
              <IconSearch />
              <input
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
                placeholder="Cari role..."
                aria-label="Cari role"
              />
            </label>
          </div>
          <div className={styles.roleGrid}>
            {filteredRoles.map((role) => (
              <article className={styles.roleCard} key={role.id}>
                <div className={styles.roleHeading}>
                  <span className={styles.roleIcon}>
                    <IconShield />
                  </span>
                  <span className={styles.roleTitle}>
                    <b>{role.name}</b>
                    {role.protected && <i>System</i>}
                  </span>
                  <span className={styles.roleActions}>
                    <button aria-label={`Edit role ${role.name}`} onClick={() => onEdit(role)}>
                      <IconEdit />
                    </button>
                    <button
                      aria-label={`Hapus role ${role.name}`}
                      disabled={role.protected || role.adminCount > 0}
                      onClick={() => onDeleteSelect(role)}
                    >
                      <IconTrash />
                    </button>
                  </span>
                </div>
                <p>{role.description}</p>
                <div className={styles.roleMeta}>
                  <span>
                    <IconUsers /> {role.adminCount} akun admin
                  </span>
                  <span>{role.permissions.length} izin</span>
                </div>
                <div className={styles.permissionChips}>
                  {role.permissions.map((key) => (
                    <span key={key}>{permissions.find((permission) => permission.key === key)?.label}</span>
                  ))}
                </div>
                <button className={styles.permissionButton} onClick={() => onEdit(role)}>
                  Atur izin akses <span>→</span>
                </button>
              </article>
            ))}
          </div>
          {!filteredRoles.length && (
            <div className={styles.empty}>
              <IconShield />
              <b>Role tidak ditemukan</b>
              <span>Coba kata kunci lain.</span>
            </div>
          )}
          <p className={styles.demoNote}>
            Role dan izin masih simulasi. Perubahan belum diterapkan pada autentikasi server.
          </p>
        </Box>
        <Box className={styles.panel} bordered rounded>
          <div className={styles.permissionHeader}>
            <div>
              <h2>Matriks Izin Akses</h2>
              <p>Ringkasan area dashboard yang bisa diakses tiap role.</p>
            </div>
            <button className={styles.saveButton} onClick={onSaveChanges}>
              <IconDeviceFloppy /> Simpan Perubahan
            </button>
          </div>
          <div className={styles.matrixWrap}>
            <table>
              <thead>
                <tr>
                  <th>Area</th>
                  {roles.map((role) => (
                    <th key={role.id}>{role.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {permissions.map((permission) => (
                  <tr key={permission.key}>
                    <td>
                      <b>{permission.label}</b>
                      <small>{permission.description}</small>
                    </td>
                    {roles.map((role) => (
                      <td key={role.id}>
                        <span
                          className={`${styles.permissionState} ${role.permissions.includes(permission.key) ? styles.allowed : styles.denied}`}
                          aria-label={role.permissions.includes(permission.key) ? 'Diizinkan' : 'Tidak diizinkan'}
                        >
                          {role.permissions.includes(permission.key) ? '✓' : '—'}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={styles.saveMessage}>
            {saved
              ? 'Perubahan role tersimpan untuk sesi ini.'
              : 'Matriks mengikuti izin yang tercatat pada tiap role.'}
          </p>
        </Box>
      </div>
      {formMode && (
        <div
          className={styles.overlay}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onCloseForm();
          }}
        >
          <section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="role-dialog-title">
            <div className={styles.dialogHeading}>
              <div>
                <h2 id="role-dialog-title">{formMode === 'create' ? 'Buat Role' : `Atur Role: ${form.name}`}</h2>
                <p>Atur identitas role dan area dashboard yang dapat diakses.</p>
              </div>
              <button className={styles.closeButton} aria-label="Tutup" onClick={onCloseForm}>
                <IconX />
              </button>
            </div>
            <form onSubmit={onSave}>
              <label>
                Nama Role
                <input
                  required
                  autoFocus
                  value={form.name}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => updateField('name', event.target.value)}
                  placeholder="Contoh: Editor Konten"
                  disabled={formMode === 'edit' && roles.find((role) => role.name === form.name)?.protected}
                />
              </label>
              <label>
                Deskripsi
                <input
                  required
                  value={form.description}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => updateField('description', event.target.value)}
                  placeholder="Ringkasan tanggung jawab role"
                />
              </label>
              <fieldset className={styles.permissionList}>
                <legend>Izin Akses</legend>
                {permissions.map((permission) => (
                  <label key={permission.key}>
                    <span>
                      <b>{permission.label}</b>
                      <small>{permission.description}</small>
                    </span>
                    <input
                      type="checkbox"
                      checked={form.permissions.includes(permission.key)}
                      onChange={() => onPermissionToggle(permission.key)}
                    />
                  </label>
                ))}
              </fieldset>
              <p className={styles.formNote}>
                Perubahan belum memengaruhi akses akun admin sampai sistem role terhubung ke backend.
              </p>
              <div className={styles.dialogActions}>
                <button type="button" className={styles.cancelButton} onClick={onCloseForm}>
                  Batal
                </button>
                <button type="submit" className={styles.createButton}>
                  {formMode === 'create' ? 'Simpan Role' : 'Simpan Perubahan'}
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
          <section className={styles.dialog} role="alertdialog" aria-modal="true" aria-labelledby="delete-role-title">
            <div className={styles.dialogHeading}>
              <div>
                <h2 id="delete-role-title">Hapus role {deleteTarget.name}?</h2>
                <p>Role ini akan dihapus dari daftar prototipe.</p>
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
                <IconTrash /> Hapus Role
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
};
