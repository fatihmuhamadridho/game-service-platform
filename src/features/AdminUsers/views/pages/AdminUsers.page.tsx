'use client';

import { useMemo, useState, type FormEvent } from 'react';
import type {
  AdminUserForm,
  AdminUserRoleFilter,
  AdminUserStatusFilter,
  AdminUserView,
} from '../interfaces/admin-user.interface';
import { AdminUsersTemplate } from '../templates/AdminUsers.template';

const seedUsers: AdminUserView[] = [
  {
    id: 'user-1',
    name: 'Budi Santoso',
    username: 'budi123',
    email: 'budi.santoso@example.com',
    role: 'Member',
    status: 'Aktif',
    joinedAt: '7 Okt 2026',
  },
  {
    id: 'user-2',
    name: 'Santi Putri',
    username: 'santoso98',
    email: 'santi.putri@example.com',
    role: 'Member',
    status: 'Aktif',
    joinedAt: '6 Okt 2026',
  },
  {
    id: 'user-3',
    name: 'Indah Putri',
    username: 'indahputri',
    email: 'indah.putri@example.com',
    role: 'Member',
    status: 'Aktif',
    joinedAt: '5 Okt 2026',
  },
  {
    id: 'user-4',
    name: 'Raka Pratama',
    username: 'rakaaa',
    email: 'raka.pratama@example.com',
    role: 'Member',
    status: 'Diblokir',
    joinedAt: '4 Okt 2026',
  },
  {
    id: 'user-5',
    name: 'Dimas Saputra',
    username: 'dimasaja',
    email: 'dimas.saputra@example.com',
    role: 'Admin',
    status: 'Aktif',
    joinedAt: '2 Okt 2026',
  },
  {
    id: 'user-6',
    name: 'Fatih Muhamad Ridho',
    username: 'fatih',
    email: 'fatih@example.com',
    role: 'Super Admin',
    status: 'Aktif',
    joinedAt: '1 Okt 2026',
  },
];

const emptyForm: AdminUserForm = { name: '', username: '', email: '', role: 'Member', status: 'Aktif' };

export const AdminUsersPage = () => {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState(seedUsers);
  const [statusFilter, setStatusFilter] = useState<AdminUserStatusFilter>('Semua');
  const [roleFilter, setRoleFilter] = useState<AdminUserRoleFilter>('Semua Role');
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AdminUserForm>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<AdminUserView | null>(null);
  const [viewTarget, setViewTarget] = useState<AdminUserView | null>(null);

  const filteredUsers = useMemo(
    () =>
      users.filter((user) => {
        const matchesQuery = `${user.name} ${user.username} ${user.email}`.toLowerCase().includes(query.toLowerCase());
        const matchesStatus = statusFilter === 'Semua' || user.status === statusFilter;
        const matchesRole = roleFilter === 'Semua Role' || user.role === roleFilter;
        return matchesQuery && matchesStatus && matchesRole;
      }),
    [users, query, statusFilter, roleFilter]
  );

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setFormMode('create');
  };

  const openEdit = (user: AdminUserView) => {
    setEditingId(user.id);
    setForm({ name: user.name, username: user.username, email: user.email, role: user.role, status: user.status });
    setFormMode('edit');
  };

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextUser = {
      ...form,
      name: form.name.trim(),
      username: form.username.trim().replace(/^@/, ''),
      email: form.email.trim().toLowerCase(),
    };
    if (formMode === 'edit' && editingId) {
      setUsers((current) => current.map((user) => (user.id === editingId ? { ...user, ...nextUser } : user)));
    } else {
      setUsers((current) => [{ id: `user-${Date.now()}`, ...nextUser, joinedAt: 'Baru saja' }, ...current]);
    }
    setFormMode(null);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setUsers((current) => current.filter((user) => user.id !== deleteTarget.id));
    setDeleteTarget(null);
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
      adminCount={users.filter((user) => user.role !== 'Member').length}
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
    />
  );
};
