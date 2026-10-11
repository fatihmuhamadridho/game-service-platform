'use client';

import { useMemo, useState, type FormEvent } from 'react';
import type {
  AdminAccountForm,
  AdminAccountRoleFilter,
  AdminAccountStatusFilter,
  AdminAccountView,
} from '../interfaces/admin-account.interface';
import { AdminManagementTemplate } from '../templates/AdminManagement.template';

const seedAdmins: AdminAccountView[] = [
  {
    id: 'admin-1',
    name: 'Fatih Muhamad Ridho',
    email: 'fatih@example.com',
    role: 'Super Admin',
    status: 'Aktif',
    lastActive: 'Sedang aktif',
  },
  {
    id: 'admin-2',
    name: 'Nadia Prameswari',
    email: 'nadia@example.com',
    role: 'Admin',
    status: 'Aktif',
    lastActive: '10 Okt 2026, 16:42',
  },
  {
    id: 'admin-3',
    name: 'Dewi Lestari',
    email: 'dewi@example.com',
    role: 'Admin',
    status: 'Aktif',
    lastActive: '10 Okt 2026, 14:18',
  },
  {
    id: 'admin-4',
    name: 'Arif Ramadhan',
    email: 'arif@example.com',
    role: 'Admin',
    status: 'Nonaktif',
    lastActive: '1 Okt 2026, 09:30',
  },
];

const emptyForm: AdminAccountForm = { name: '', email: '', role: 'Admin', status: 'Aktif' };

export const AdminManagementPage = () => {
  const [query, setQuery] = useState('');
  const [admins, setAdmins] = useState(seedAdmins);
  const [roleFilter, setRoleFilter] = useState<AdminAccountRoleFilter>('Semua Role');
  const [statusFilter, setStatusFilter] = useState<AdminAccountStatusFilter>('Semua');
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AdminAccountForm>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<AdminAccountView | null>(null);
  const [viewTarget, setViewTarget] = useState<AdminAccountView | null>(null);

  const filteredAdmins = useMemo(
    () =>
      admins.filter((admin) => {
        const matchesQuery = `${admin.name} ${admin.email}`.toLowerCase().includes(query.toLowerCase());
        const matchesRole = roleFilter === 'Semua Role' || admin.role === roleFilter;
        const matchesStatus = statusFilter === 'Semua' || admin.status === statusFilter;
        return matchesQuery && matchesRole && matchesStatus;
      }),
    [admins, query, roleFilter, statusFilter]
  );

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setFormMode('create');
  };

  const openEdit = (admin: AdminAccountView) => {
    setEditingId(admin.id);
    setForm({ name: admin.name, email: admin.email, role: admin.role, status: admin.status });
    setFormMode('edit');
  };

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextAdmin = { ...form, name: form.name.trim(), email: form.email.trim().toLowerCase() };
    if (formMode === 'edit' && editingId) {
      setAdmins((current) => current.map((admin) => (admin.id === editingId ? { ...admin, ...nextAdmin } : admin)));
    } else {
      setAdmins((current) => [
        { id: `admin-${Date.now()}`, ...nextAdmin, lastActive: 'Belum pernah login' },
        ...current,
      ]);
    }
    setFormMode(null);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setAdmins((current) => current.filter((admin) => admin.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <AdminManagementTemplate
      admins={admins}
      filteredAdmins={filteredAdmins}
      query={query}
      onQueryChange={setQuery}
      roleFilter={roleFilter}
      onRoleFilterChange={setRoleFilter}
      statusFilter={statusFilter}
      onStatusFilterChange={setStatusFilter}
      activeCount={admins.filter((admin) => admin.status === 'Aktif').length}
      superAdminCount={admins.filter((admin) => admin.role === 'Super Admin').length}
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
