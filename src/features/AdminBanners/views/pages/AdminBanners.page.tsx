'use client';

import { useMemo, useState, type FormEvent } from 'react';
import type { AdminBannerForm, AdminBannerStatusFilter, AdminBannerView } from '../interfaces/admin-banner.interface';
import { AdminBannersTemplate } from '../templates/AdminBanners.template';

const seedBanners: AdminBannerView[] = [
  {
    id: 'banner-1',
    title: 'Banner Utama JokiHub',
    description: 'Banner promosi utama untuk halaman beranda.',
    imageUrl: '',
    imageName: '',
    targetUrl: '/',
    placement: 'Homepage',
    active: true,
    priority: 1,
    updatedAt: '11 Okt 2026',
  },
  {
    id: 'banner-2',
    title: 'Layanan Mobile Legends',
    description: 'Banner layanan untuk halaman Mobile Legends.',
    imageUrl: '',
    imageName: '',
    targetUrl: '/games',
    placement: 'Halaman Game',
    active: true,
    priority: 2,
    updatedAt: '9 Okt 2026',
  },
  {
    id: 'banner-3',
    title: 'Promo Akhir Pekan',
    description: 'Banner promo yang sedang tidak ditayangkan.',
    imageUrl: '',
    imageName: '',
    targetUrl: '/games',
    placement: 'Promo',
    active: false,
    priority: 3,
    updatedAt: '5 Okt 2026',
  },
];

const emptyForm: AdminBannerForm = {
  title: '',
  description: '',
  imageUrl: '',
  imageName: '',
  targetUrl: '',
  placement: 'Homepage',
  active: true,
  priority: 1,
};

export const AdminBannersPage = () => {
  const [query, setQuery] = useState('');
  const [banners, setBanners] = useState(seedBanners);
  const [statusFilter, setStatusFilter] = useState<AdminBannerStatusFilter>('Semua');
  const [placementFilter, setPlacementFilter] = useState('Semua Posisi');
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AdminBannerForm>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<AdminBannerView | null>(null);

  const filteredBanners = useMemo(
    () =>
      banners
        .filter((banner) => {
          const matchesQuery = `${banner.title} ${banner.description} ${banner.placement}`
            .toLowerCase()
            .includes(query.toLowerCase());
          const matchesStatus = statusFilter === 'Semua' || (statusFilter === 'Aktif' ? banner.active : !banner.active);
          const matchesPlacement = placementFilter === 'Semua Posisi' || banner.placement === placementFilter;
          return matchesQuery && matchesStatus && matchesPlacement;
        })
        .sort((a, b) => a.priority - b.priority),
    [banners, query, statusFilter, placementFilter]
  );

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, priority: banners.length + 1 });
    setFormMode('create');
  };

  const openEdit = (banner: AdminBannerView) => {
    setEditingId(banner.id);
    setForm({
      title: banner.title,
      description: banner.description,
      imageUrl: banner.imageUrl,
      imageName: banner.imageName,
      targetUrl: banner.targetUrl,
      placement: banner.placement,
      active: banner.active,
      priority: banner.priority,
    });
    setFormMode('edit');
  };

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextBanner = {
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      targetUrl: form.targetUrl.trim(),
      updatedAt: 'Baru saja',
    };
    if (formMode === 'edit' && editingId) {
      setBanners((current) =>
        current.map((banner) => (banner.id === editingId ? { ...banner, ...nextBanner } : banner))
      );
    } else {
      setBanners((current) => [{ id: `banner-${Date.now()}`, ...nextBanner }, ...current]);
    }
    setFormMode(null);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setBanners((current) => current.filter((banner) => banner.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <AdminBannersTemplate
      banners={banners}
      filteredBanners={filteredBanners}
      query={query}
      onQueryChange={setQuery}
      statusFilter={statusFilter}
      onStatusFilterChange={setStatusFilter}
      placementFilter={placementFilter}
      onPlacementFilterChange={setPlacementFilter}
      activeCount={banners.filter((banner) => banner.active).length}
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
