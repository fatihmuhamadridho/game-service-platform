'use client';

import { apiFetch } from '@services/apiFetch.service';

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import type {
  AdminUserForm,
  AdminUserRoleFilter,
  AdminUserStatusFilter,
  AdminUserView,
} from '../interfaces/admin-user.interface';
import { AdminUsersTemplate } from '../templates/AdminUsers.template';

const emptyForm: AdminUserForm = { name: '', username: '', email: '', role: 'Member', status: 'Aktif' };
const displayDate = (value: string) =>
  new Date(value).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

export const AdminUsersPage = () => {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<AdminUserView[]>([]);
  const [statusFilter, setStatusFilter] = useState<AdminUserStatusFilter>('Semua');
  const [roleFilter, setRoleFilter] = useState<AdminUserRoleFilter>('Semua Role');
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AdminUserForm>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<AdminUserView | null>(null);
  const [viewTarget, setViewTarget] = useState<AdminUserView | null>(null);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    const status = statusFilter === 'Semua' ? '' : statusFilter === 'Aktif' ? 'ACTIVE' : 'BLOCKED';
    const params = new URLSearchParams({
      page: '1',
      pageSize: '100',
      ...(query ? { search: query } : {}),
      ...(status ? { status } : {}),
    });
    try {
      const response = await apiFetch(`/api/admin/users/v1/list?${params}`, { cache: 'no-store' });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.status?.message ?? 'Gagal memuat user.');
      setUsers(
        payload.data.users.map(
          (user: { id: string; name: string; username: string; email: string; status: string; joinedAt: string }) => ({
            id: user.id,
            name: user.name,
            username: user.username,
            email: user.email,
            role: 'Member' as const,
            status: user.status === 'ACTIVE' ? ('Aktif' as const) : ('Diblokir' as const),
            joinedAt: displayDate(user.joinedAt),
          })
        )
      );
      setError('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Gagal memuat user.');
    }
  }, [query, statusFilter]);
  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);
  const filteredUsers = useMemo(
    () => users.filter((user) => roleFilter === 'Semua Role' || user.role === roleFilter),
    [users, roleFilter]
  );
  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setFormMode('create');
  };
  const openEdit = (user: AdminUserView) => {
    setEditingId(user.id);
    setForm({ name: user.name, username: user.username, email: user.email, role: 'Member', status: user.status });
    setFormMode('edit');
  };
  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    const body = {
      name: form.name.trim(),
      username: form.username.trim().replace(/^@/, '').toLowerCase(),
      email: form.email.trim().toLowerCase(),
      ...(formMode === 'edit' ? { status: form.status === 'Aktif' ? 'ACTIVE' : 'BLOCKED' } : {}),
    };
    try {
      const response = await apiFetch(
        formMode === 'edit' && editingId ? `/api/admin/users/v1/update/${editingId}` : '/api/admin/users/v1/create',
        {
          method: formMode === 'edit' ? 'PATCH' : 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(body),
        }
      );
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.status?.message ?? 'Gagal menyimpan user.');
      setFormMode(null);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Gagal menyimpan user.');
    }
  };
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setError('');
    try {
      const response = await apiFetch(`/api/admin/users/v1/delete/${deleteTarget.id}`, { method: 'DELETE' });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.status?.message ?? 'Gagal menghapus user.');
      setDeleteTarget(null);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Gagal menghapus user.');
    }
  };
  const viewUser = async (user: AdminUserView) => {
    try {
      const response = await apiFetch(`/api/admin/users/v1/detail/${user.id}`, { cache: 'no-store' });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.status?.message ?? 'Gagal memuat detail user.');
      const detail = payload.data.user;
      setViewTarget({
        ...user,
        whatsapp: detail.whatsapp,
        tier: detail.tier,
        orderCount: detail.orderCount,
        totalSpend: detail.totalSpend,
      });
      setError('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Gagal memuat detail user.');
    }
  };
  return (
    <AdminUsersTemplate
      users={users}
      filteredUsers={filteredUsers}
      query={query}
      onQueryChange={setQuery}
      statusFilter={statusFilter}
      onStatusFilterChange={setStatusFilter}
      roleFilter={roleFilter}
      onRoleFilterChange={setRoleFilter}
      activeCount={users.filter((user) => user.status === 'Aktif').length}
      adminCount={users.filter((user) => user.status === 'Diblokir').length}
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
      onViewDetail={viewUser}
      error={error}
    />
  );
};
