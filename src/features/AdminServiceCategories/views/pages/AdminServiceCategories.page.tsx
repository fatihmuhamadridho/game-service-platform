'use client';

import { useMemo, useState, type FormEvent } from 'react';
import type {
  AdminServiceCategoryForm,
  AdminServiceCategoryStatusFilter,
  AdminServiceCategoryView,
} from '../interfaces/admin-service-category.interface';
import { AdminServiceCategoriesTemplate } from '../templates/AdminServiceCategories.template';

const seedCategories: AdminServiceCategoryView[] = [
  {
    id: 'category-1',
    name: 'Top Up',
    slug: 'top-up',
    description: 'Pembelian mata uang dan item dalam game.',
    serviceCount: 24,
    active: true,
    updatedAt: '11 Okt 2026',
  },
  {
    id: 'category-2',
    name: 'Joki Rank',
    slug: 'joki-rank',
    description: 'Layanan peningkatan rank dan progres akun.',
    serviceCount: 16,
    active: true,
    updatedAt: '10 Okt 2026',
  },
  {
    id: 'category-3',
    name: 'Akun Game',
    slug: 'akun-game',
    description: 'Jual beli akun game.',
    serviceCount: 8,
    active: true,
    updatedAt: '9 Okt 2026',
  },
  {
    id: 'category-4',
    name: 'Voucher',
    slug: 'voucher',
    description: 'Voucher dan saldo untuk layanan digital.',
    serviceCount: 5,
    active: false,
    updatedAt: '6 Okt 2026',
  },
];

const emptyForm: AdminServiceCategoryForm = { name: '', slug: '', description: '', active: true };
const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export const AdminServiceCategoriesPage = () => {
  const [query, setQuery] = useState('');
  const [categories, setCategories] = useState(seedCategories);
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

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextCategory = {
      ...form,
      name: form.name.trim(),
      slug: slugify(form.slug || form.name),
      updatedAt: 'Baru saja',
    };
    if (formMode === 'edit' && editingId) {
      setCategories((current) =>
        current.map((category) => (category.id === editingId ? { ...category, ...nextCategory } : category))
      );
    } else {
      setCategories((current) => [{ id: `category-${Date.now()}`, ...nextCategory, serviceCount: 0 }, ...current]);
    }
    setFormMode(null);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setCategories((current) => current.filter((category) => category.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <AdminServiceCategoriesTemplate
      categories={categories}
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
