'use client';

import { useMemo, useState, type FormEvent } from 'react';
import type {
  AdminServiceForm,
  AdminServiceStatusFilter,
  AdminServiceView,
} from '../interfaces/admin-service.interface';
import { AdminServicesTemplate } from '../templates/AdminServices.template';

const seedServices: AdminServiceView[] = [
  {
    id: 'service-1',
    name: 'Joki Rank Mythic',
    game: 'Mobile Legends',
    category: 'Joki Rank',
    price: 85000,
    estimate: '1–2 hari',
    active: true,
    updatedAt: '11 Okt 2026',
  },
  {
    id: 'service-2',
    name: 'Top Up Diamond 100',
    game: 'Free Fire',
    category: 'Top Up',
    price: 25000,
    estimate: 'Instan',
    active: true,
    updatedAt: '10 Okt 2026',
  },
  {
    id: 'service-3',
    name: 'Top Up Robux 400',
    game: 'Roblox',
    category: 'Top Up',
    price: 120000,
    estimate: 'Instan',
    active: true,
    updatedAt: '9 Okt 2026',
  },
  {
    id: 'service-4',
    name: 'Joki Rank Silver → Gold',
    game: 'Valorant',
    category: 'Joki Rank',
    price: 70000,
    estimate: '1–3 hari',
    active: true,
    updatedAt: '8 Okt 2026',
  },
  {
    id: 'service-5',
    name: 'Top Up Genesis',
    game: 'Genshin Impact',
    category: 'Top Up',
    price: 150000,
    estimate: 'Instan',
    active: false,
    updatedAt: '6 Okt 2026',
  },
  {
    id: 'service-6',
    name: 'Layanan Custom',
    game: 'Mobile Legends',
    category: 'Joki Rank',
    price: null,
    estimate: 'Hubungi admin',
    active: true,
    updatedAt: '5 Okt 2026',
  },
];

const games = ['Mobile Legends', 'Free Fire', 'Roblox', 'Valorant', 'Genshin Impact', 'PUBG Mobile'];
const categories = ['Top Up', 'Joki Rank', 'Akun Game', 'Voucher'];
const emptyForm: AdminServiceForm = {
  name: '',
  game: games[0],
  category: categories[0],
  price: 0,
  estimate: '',
  active: true,
};

export const AdminServicesPage = () => {
  const [query, setQuery] = useState('');
  const [services, setServices] = useState(seedServices);
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
        const matchesCategory = categoryFilter === 'Semua Kategori' || service.category === categoryFilter;
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
      game: service.game,
      category: service.category,
      price: service.price,
      estimate: service.estimate,
      active: service.active,
    });
    setFormMode('edit');
  };

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextService = { ...form, name: form.name.trim(), estimate: form.estimate.trim(), updatedAt: 'Baru saja' };
    if (formMode === 'edit' && editingId) {
      setServices((current) =>
        current.map((service) => (service.id === editingId ? { ...service, ...nextService } : service))
      );
    } else {
      setServices((current) => [{ id: `service-${Date.now()}`, ...nextService }, ...current]);
    }
    setFormMode(null);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setServices((current) => current.filter((service) => service.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <AdminServicesTemplate
      services={services}
      filteredServices={filteredServices}
      games={games}
      categories={categories}
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
