'use client';

import { apiFetch } from '@services/apiFetch.service';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import type {
  AdminServiceCategoryForm,
  AdminServiceCategoryStatusFilter,
  AdminServiceCategoryView,
} from '../interfaces/admin-service-category.interface';
import { AdminServiceCategoriesTemplate } from '../templates/AdminServiceCategories.template';

const emptyForm: AdminServiceCategoryForm = { name: '', slug: '', description: '', active: true };
const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export const AdminServiceCategoriesPage = () => {
  const [query, setQuery] = useState('');
  const [categories, setCategories] = useState<AdminServiceCategoryView[]>([]);
  const [error, setError] = useState('');
  const load = async () => {
    try {
      const response = await apiFetch('/api/admin/service-categories/v1/list', { cache: 'no-store' });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.status?.message ?? 'Gagal memuat kategori.');
      setCategories(payload.data.categories);
      setError('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Gagal memuat kategori.');
    }
  };
  useEffect(() => {
    void Promise.resolve().then(load);
  }, []);
  const [statusFilter, setStatusFilter] = useState<AdminServiceCategoryStatusFilter>('Semua');
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AdminServiceCategoryForm>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<AdminServiceCategoryView | null>(null);

  const filteredCategories = useMemo(
    () =>
      categories.filter((category) => {
        const matchesQuery = `${category.name} ${category.slug} ${category.description}`
          .toLowerCase()
          .includes(query.toLowerCase());
        const matchesStatus =
          statusFilter === 'Semua' || (statusFilter === 'Aktif' ? category.active : !category.active);
        return matchesQuery && matchesStatus;
      }),
    [categories, query, statusFilter]
  );

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setFormMode('create');
  };

  const openEdit = (category: AdminServiceCategoryView) => {
    setEditingId(category.id);
    setForm({ name: category.name, slug: category.slug, description: category.description, active: category.active });
    setFormMode('edit');
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    try {
      const response = await apiFetch(
        formMode === 'edit' && editingId
          ? `/api/admin/service-categories/v1/update/${editingId}`
          : '/api/admin/service-categories/v1/create',
        {
          method: formMode === 'edit' ? 'PUT' : 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            name: form.name.trim(),
            slug: slugify(form.slug || form.name),
            description: form.description.trim() || null,
            isActive: form.active,
          }),
        }
      );
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.status?.message ?? 'Gagal menyimpan kategori.');
      setFormMode(null);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Gagal menyimpan kategori.');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setError('');
    try {
      const response = await apiFetch(`/api/admin/service-categories/v1/delete/${deleteTarget.id}`, { method: 'DELETE' });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.status?.message ?? 'Gagal menghapus kategori.');
      setDeleteTarget(null);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Gagal menghapus kategori.');
    }
  };

  return (
    <AdminServiceCategoriesTemplate
      categories={categories}
      error={error}
      filteredCategories={filteredCategories}
      query={query}
      onQueryChange={setQuery}
      statusFilter={statusFilter}
      onStatusFilterChange={setStatusFilter}
      activeCount={categories.filter((category) => category.active).length}
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
    />
  );
};
