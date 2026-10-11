'use client';

import { useMemo, useState, type FormEvent } from 'react';
import type { Permission, PermissionKey, RoleForm, RoleView } from '../interfaces/admin-accounts-roles.interface';
import { AdminAccountsRolesTemplate } from '../templates/AdminAccountsRoles.template';

const permissions: Permission[] = [
  { key: 'dashboard', label: 'Dashboard', description: 'Melihat ringkasan dan metrik platform.' },
  { key: 'orders', label: 'Pesanan', description: 'Mengelola pesanan, refund, dan komplain.' },
  { key: 'catalog', label: 'Produk & Layanan', description: 'Mengelola game, kategori, layanan, dan voucher.' },
  { key: 'users', label: 'Pengguna', description: 'Mengelola user, member, dan akun admin.' },
  { key: 'content', label: 'Konten', description: 'Mengelola banner, pengumuman, halaman, dan FAQ.' },
  { key: 'finance', label: 'Keuangan', description: 'Melihat transaksi, payout, dan rekening.' },
  { key: 'settings', label: 'Pengaturan', description: 'Mengubah konfigurasi dan hak akses.' },
];
const allPermissionKeys: PermissionKey[] = permissions.map((permission) => permission.key);
const seedRoles: RoleView[] = [
  {
    id: 'role-super-admin',
    name: 'Super Admin',
    description: 'Akses penuh untuk konfigurasi dan operasional platform.',
    adminCount: 1,
    permissions: allPermissionKeys,
    protected: true,
  },
  {
    id: 'role-admin',
    name: 'Admin',
    description: 'Akses pengelolaan operasional harian.',
    adminCount: 3,
    permissions: ['dashboard', 'orders', 'catalog', 'users', 'content'],
  },
];

export const AdminAccountsRolesPage = () => {
  const [roles, setRoles] = useState(seedRoles);
  const [query, setQuery] = useState('');
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<RoleForm>({ name: '', description: '', permissions: ['dashboard'] });
  const [deleteTarget, setDeleteTarget] = useState<RoleView | null>(null);
  const [saved, setSaved] = useState(false);
  const filteredRoles = useMemo(
    () => roles.filter((role) => `${role.name} ${role.description}`.toLowerCase().includes(query.toLowerCase())),
    [roles, query]
  );
  const openCreate = () => {
    setEditingId(null);
    setForm({ name: '', description: '', permissions: ['dashboard'] });
    setFormMode('create');
  };
  const openEdit = (role: RoleView) => {
    setEditingId(role.id);
    setForm({ name: role.name, description: role.description, permissions: [...role.permissions] });
    setFormMode('edit');
  };
  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = { ...form, name: form.name.trim(), description: form.description.trim() };
    if (formMode === 'edit' && editingId)
      setRoles((current) => current.map((role) => (role.id === editingId ? { ...role, ...next } : role)));
    else setRoles((current) => [...current, { id: `role-${Date.now()}`, ...next, adminCount: 0 }]);
    setFormMode(null);
    setSaved(false);
  };
  const togglePermission = (key: PermissionKey) =>
    setForm((current) => ({
      ...current,
      permissions: current.permissions.includes(key)
        ? current.permissions.filter((permission) => permission !== key)
        : [...current.permissions, key],
    }));
  const confirmDelete = () => {
    if (!deleteTarget) return;
    setRoles((current) => current.filter((role) => role.id !== deleteTarget.id));
    setDeleteTarget(null);
  };
  const saveChanges = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 3000);
  };
  return (
    <AdminAccountsRolesTemplate
      roles={roles}
      filteredRoles={filteredRoles}
      permissions={permissions}
      query={query}
      onQueryChange={setQuery}
      formMode={formMode}
      form={form}
      onFormChange={setForm}
      onPermissionToggle={togglePermission}
      onCreate={openCreate}
      onEdit={openEdit}
      onSave={handleSave}
      onCloseForm={() => setFormMode(null)}
      deleteTarget={deleteTarget}
      onDeleteSelect={setDeleteTarget}
      onDeleteConfirm={confirmDelete}
      onSaveChanges={saveChanges}
      saved={saved}
    />
  );
};
