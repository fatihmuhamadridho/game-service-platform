'use client';

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import type {
  Permission,
  PermissionCatalogItem,
  PermissionKey,
  RoleForm,
  RoleView,
} from '../interfaces/admin-accounts-roles.interface';
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
export const AdminAccountsRolesPage = () => {
  const [roles, setRoles] = useState<RoleView[]>([]);
  const [permissionCatalog, setPermissionCatalog] = useState<PermissionCatalogItem[]>([]);
  const [query, setQuery] = useState('');
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<RoleForm>({ name: '', description: '', permissions: ['dashboard'] });
  const [deleteTarget, setDeleteTarget] = useState<RoleView | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/roles/v1/list', { cache: 'no-store' });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.status?.message ?? 'Gagal memuat role.');
      setRoles(payload.data.roles as RoleView[]);
      setPermissionCatalog(payload.data.permissionCatalog as PermissionCatalogItem[]);
      setError('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Gagal memuat role.');
    }
  }, []);
  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);
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
  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    const code = form.name
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 50);
    const permissionIds = form.permissions
      .map((key) => permissionCatalog.find((permission) => permission.key === key)?.id)
      .filter((id): id is string => Boolean(id));
    if (permissionIds.length !== form.permissions.length) {
      setError('Katalog izin belum siap. Segarkan halaman lalu coba lagi.');
      return;
    }
    try {
      const response = await fetch(
        formMode === 'edit' && editingId ? `/api/admin/roles/v1/update/${editingId}` : '/api/admin/roles/v1/create',
        {
          method: formMode === 'edit' ? 'PUT' : 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            name: form.name.trim(),
            code,
            description: form.description.trim() || null,
            status: 'ACTIVE',
            permissions: permissionIds,
          }),
        }
      );
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.status?.message ?? 'Gagal menyimpan role.');
      setFormMode(null);
      setSaved(false);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Gagal menyimpan role.');
    }
  };
  const togglePermission = (key: PermissionKey) =>
    setForm((current) => ({
      ...current,
      permissions: current.permissions.includes(key)
        ? current.permissions.filter((permission) => permission !== key)
        : [...current.permissions, key],
    }));
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setError('');
    try {
      const response = await fetch(`/api/admin/roles/v1/delete/${deleteTarget.id}`, { method: 'DELETE' });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.status?.message ?? 'Gagal menghapus role.');
      setDeleteTarget(null);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Gagal menghapus role.');
    }
  };
  const saveChanges = () => {
    setSaved(true);
    void load();
    window.setTimeout(() => setSaved(false), 3000);
  };
  return (
    <AdminAccountsRolesTemplate
      roles={roles}
      error={error}
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
