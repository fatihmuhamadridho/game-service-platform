'use client';

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import type {
  AdminAccountForm,
  AdminAccountRoleFilter,
  AdminAccountStatusFilter,
  AdminAccountView,
} from '../interfaces/admin-account.interface';
import { AdminManagementTemplate } from '../templates/AdminManagement.template';

type RoleOption = { id: string; name: string; protected?: boolean };
const emptyForm: AdminAccountForm = { name: '', username: '', email: '', roleIds: [], status: 'Aktif' };
export const AdminManagementPage = () => {
  const [query, setQuery] = useState('');
  const [admins, setAdmins] = useState<AdminAccountView[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [roleFilter, setRoleFilter] = useState<AdminAccountRoleFilter>('Semua Role');
  const [statusFilter, setStatusFilter] = useState<AdminAccountStatusFilter>('Semua');
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AdminAccountForm>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<AdminAccountView | null>(null);
  const [viewTarget, setViewTarget] = useState<AdminAccountView | null>(null);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    const status = statusFilter === 'Semua' ? '' : statusFilter === 'Aktif' ? 'ACTIVE' : 'INACTIVE';
    const params = new URLSearchParams({
      page: '1',
      pageSize: '100',
      ...(query ? { search: query } : {}),
      ...(status ? { status } : {}),
    });
    try {
      const [adminResponse, roleResponse] = await Promise.all([
        fetch(`/api/admin/admin-users/v1/list?${params}`, { cache: 'no-store' }),
        fetch('/api/admin/roles/v1/list', { cache: 'no-store' }),
      ]);
      const [adminPayload, rolePayload] = await Promise.all([adminResponse.json(), roleResponse.json()]);
      if (!adminResponse.ok || !roleResponse.ok)
        throw new Error(adminPayload.status?.message ?? rolePayload.status?.message ?? 'Gagal memuat akun admin.');
      setAdmins(
        adminPayload.data.admins.map(
          (row: {
            id: string;
            username: string;
            name: string;
            email: string;
            role: string;
            roleIds: string[];
            status: string;
            lastActive: string;
          }) => ({
            id: row.id,
            username: row.username,
            name: row.name,
            email: row.email,
            role: row.role === 'Super Admin' ? ('Super Admin' as const) : ('Admin' as const),
            roleIds: row.roleIds,
            status: row.status === 'ACTIVE' ? ('Aktif' as const) : ('Nonaktif' as const),
            lastActive: row.lastActive,
          })
        )
      );
      setRoles(
        rolePayload.data.roles.map((role: RoleOption) => ({ id: role.id, name: role.name, protected: role.protected }))
      );
      setError('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Gagal memuat akun admin.');
    }
  }, [query, statusFilter]);
  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);
  const filteredAdmins = useMemo(
    () => admins.filter((admin) => roleFilter === 'Semua Role' || admin.role === roleFilter),
    [admins, roleFilter]
  );
  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, roleIds: roles[0] ? [roles[0].id] : [] });
    setFormMode('create');
  };
  const openEdit = (admin: AdminAccountView) => {
    setEditingId(admin.id);
    setForm({
      name: admin.name,
      username: admin.username,
      email: admin.email,
      roleIds: [...admin.roleIds],
      status: admin.status,
    });
    setFormMode('edit');
  };
  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    const body = {
      name: form.name.trim(),
      username: form.username.trim().toLowerCase(),
      email: form.email.trim().toLowerCase(),
      ...(formMode === 'create'
        ? { roleIds: form.roleIds }
        : { roleIds: form.roleIds, status: form.status === 'Aktif' ? 'ACTIVE' : 'INACTIVE' }),
    };
    try {
      const response = await fetch(
        formMode === 'edit' && editingId
          ? `/api/admin/admin-users/v1/update/${editingId}`
          : '/api/admin/admin-users/v1/create',
        {
          method: formMode === 'edit' ? 'PATCH' : 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(body),
        }
      );
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.status?.message ?? 'Gagal menyimpan akun admin.');
      setFormMode(null);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Gagal menyimpan akun admin.');
    }
  };
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setError('');
    try {
      const response = await fetch(`/api/admin/admin-users/v1/delete/${deleteTarget.id}`, { method: 'DELETE' });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.status?.message ?? 'Gagal menonaktifkan akun admin.');
      setDeleteTarget(null);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Gagal menonaktifkan akun admin.');
    }
  };
  const viewAdmin = async (admin: AdminAccountView) => {
    try {
      const response = await fetch(`/api/admin/admin-users/v1/detail/${admin.id}`, { cache: 'no-store' });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.status?.message ?? 'Gagal memuat detail admin.');
      const detail = payload.data.admin;
      setViewTarget({ ...admin, username: detail.username, roleIds: detail.roleIds });
      setError('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Gagal memuat detail admin.');
    }
  };
  return (
    <AdminManagementTemplate
      admins={admins}
      filteredAdmins={filteredAdmins}
      roles={roles}
      error={error}
      query={query}
      onQueryChange={setQuery}
      roleFilter={roleFilter}
      onRoleFilterChange={setRoleFilter}
      statusFilter={statusFilter}
      onStatusFilterChange={setStatusFilter}
      activeCount={admins.filter((admin) => admin.status === 'Aktif').length}
      superAdminCount={admins.filter((admin) => admin.role === 'Super Admin' && admin.status === 'Aktif').length}
      formMode={formMode}
      form={form}
      onFormChange={setForm}
      onCreate={openCreate}
      onEdit={openEdit}
      onSave={handleSave}
      onCloseForm={() => setFormMode(null)}
      deleteTarget={deleteTarget}
      onDeleteSelect={setDeleteTarget}
      onDeleteConfirm={confirmDelete}
      viewTarget={viewTarget}
      onView={setViewTarget}
      onViewDetail={viewAdmin}
    />
  );
};
