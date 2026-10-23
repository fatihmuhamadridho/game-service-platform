'use client';

import { apiFetch } from '@services/apiFetch.service';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import type {
  AdminServiceForm,
  AdminServiceStatusFilter,
  AdminServiceView,
} from '../interfaces/admin-service.interface';
import { AdminServicesTemplate } from '../templates/AdminServices.template';

type Option = { id: string; name: string };
const emptyForm: AdminServiceForm = { name: '', gameId: '', categoryId: '', price: 0, estimate: '', active: true };

export const AdminServicesPage = () => {
  const [query, setQuery] = useState('');
  const [services, setServices] = useState<AdminServiceView[]>([]);
  const [games, setGames] = useState<Option[]>([]);
  const [categories, setCategories] = useState<Option[]>([]);
  const [error, setError] = useState('');
  const load = async () => {
    try {
      const response = await apiFetch('/api/admin/services/v1/list', { cache: 'no-store' });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.status?.message ?? 'Gagal memuat layanan.');
      setServices(payload.data.services);
      setGames(payload.data.games);
      setCategories(payload.data.categories);
      setError('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Gagal memuat layanan.');
    }
  };
  useEffect(() => {
    void Promise.resolve().then(load);
  }, []);
  const [statusFilter, setStatusFilter] = useState<AdminServiceStatusFilter>('Semua');
  const [categoryFilter, setCategoryFilter] = useState('Semua Kategori');
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AdminServiceForm>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<AdminServiceView | null>(null);

  const filteredServices = useMemo(
    () =>
      services.filter((service) => {
        const matchesQuery = `${service.name} ${service.game} ${service.category}`
          .toLowerCase()
          .includes(query.toLowerCase());
        const matchesStatus = statusFilter === 'Semua' || (statusFilter === 'Aktif' ? service.active : !service.active);
        const matchesCategory = categoryFilter === 'Semua Kategori' || service.categoryId === categoryFilter;
        return matchesQuery && matchesStatus && matchesCategory;
      }),
    [services, query, statusFilter, categoryFilter]
  );

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setFormMode('create');
  };

  const openEdit = (service: AdminServiceView) => {
    setEditingId(service.id);
    setForm({
      name: service.name,
      gameId: service.gameId,
      categoryId: service.categoryId,
      price: service.price,
      estimate: service.estimate,
      active: service.active,
    });
    setFormMode('edit');
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    try {
      const response = await apiFetch(
        formMode === 'edit' && editingId
          ? `/api/admin/services/v1/update/${editingId}`
          : '/api/admin/services/v1/create',
        {
          method: formMode === 'edit' ? 'PUT' : 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            gameId: form.gameId,
            categoryId: form.categoryId,
            name: form.name.trim(),
            priceAmount: form.price,
            isCustomPrice: form.price === null,
            estimateText: form.estimate.trim(),
            isActive: form.active,
          }),
        }
      );
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.status?.message ?? 'Gagal menyimpan layanan.');
      setFormMode(null);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Gagal menyimpan layanan.');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setError('');
    try {
      const response = await apiFetch(`/api/admin/services/v1/delete/${deleteTarget.id}`, { method: 'DELETE' });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.status?.message ?? 'Gagal menghapus layanan.');
      setDeleteTarget(null);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Gagal menghapus layanan.');
    }
  };

  return (
    <AdminServicesTemplate
      services={services}
      filteredServices={filteredServices}
      games={games}
      categories={categories}
      error={error}
      query={query}
      onQueryChange={setQuery}
      statusFilter={statusFilter}
      onStatusFilterChange={setStatusFilter}
      categoryFilter={categoryFilter}
      onCategoryFilterChange={setCategoryFilter}
      activeCount={services.filter((service) => service.active).length}
      customPriceCount={services.filter((service) => service.price === null).length}
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
