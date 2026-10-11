'use client';

import { useMemo, useState, type FormEvent } from 'react';
import type {
  AdminAnnouncementForm,
  AdminAnnouncementView,
  AnnouncementStatusFilter,
  AnnouncementTypeFilter,
} from '../interfaces/admin-announcement.interface';
import { AdminAnnouncementsTemplate } from '../templates/AdminAnnouncements.template';

const seedAnnouncements: AdminAnnouncementView[] = [
  {
    id: 'announcement-1',
    title: 'Informasi Layanan JokiHub',
    content: 'Informasi umum layanan JokiHub untuk pengguna.',
    type: 'Informasi',
    audience: 'Semua Pengguna',
    status: 'Terbit',
    publishAt: '2026-10-11T08:00',
    updatedAt: '11 Okt 2026',
  },
  {
    id: 'announcement-2',
    title: 'Jadwal Pemeliharaan Sistem',
    content: 'Pemberitahuan jadwal pemeliharaan sistem.',
    type: 'Pemeliharaan',
    audience: 'Semua Pengguna',
    status: 'Terjadwal',
    publishAt: '2026-10-14T09:00',
    updatedAt: '10 Okt 2026',
  },
  {
    id: 'announcement-3',
    title: 'Promo Layanan Game',
    content: 'Informasi promo layanan yang dapat diperbarui oleh admin.',
    type: 'Promo',
    audience: 'Member',
    status: 'Draft',
    publishAt: '',
    updatedAt: '8 Okt 2026',
  },
];

const emptyForm: AdminAnnouncementForm = {
  title: '',
  content: '',
  type: 'Informasi',
  audience: 'Semua Pengguna',
  status: 'Draft',
  publishAt: '',
};

export const AdminAnnouncementsPage = () => {
  const [query, setQuery] = useState('');
  const [announcements, setAnnouncements] = useState(seedAnnouncements);
  const [statusFilter, setStatusFilter] = useState<AnnouncementStatusFilter>('Semua Status');
  const [typeFilter, setTypeFilter] = useState<AnnouncementTypeFilter>('Semua Jenis');
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AdminAnnouncementForm>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<AdminAnnouncementView | null>(null);

  const filteredAnnouncements = useMemo(
    () =>
      announcements.filter((announcement) => {
        const matchesQuery = `${announcement.title} ${announcement.content} ${announcement.type}`
          .toLowerCase()
          .includes(query.toLowerCase());
        const matchesStatus = statusFilter === 'Semua Status' || announcement.status === statusFilter;
        const matchesType = typeFilter === 'Semua Jenis' || announcement.type === typeFilter;
        return matchesQuery && matchesStatus && matchesType;
      }),
    [announcements, query, statusFilter, typeFilter]
  );

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setFormMode('create');
  };

  const openEdit = (announcement: AdminAnnouncementView) => {
    setEditingId(announcement.id);
    setForm({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      audience: announcement.audience,
      status: announcement.status,
      publishAt: announcement.publishAt,
    });
    setFormMode('edit');
  };

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextAnnouncement = {
      ...form,
      title: form.title.trim(),
      content: form.content.trim(),
      updatedAt: 'Baru saja',
    };
    if (formMode === 'edit' && editingId) {
      setAnnouncements((current) =>
        current.map((announcement) =>
          announcement.id === editingId ? { ...announcement, ...nextAnnouncement } : announcement
        )
      );
    } else {
      setAnnouncements((current) => [{ id: `announcement-${Date.now()}`, ...nextAnnouncement }, ...current]);
    }
    setFormMode(null);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setAnnouncements((current) => current.filter((announcement) => announcement.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <AdminAnnouncementsTemplate
      announcements={announcements}
      filteredAnnouncements={filteredAnnouncements}
      query={query}
      onQueryChange={setQuery}
      statusFilter={statusFilter}
      onStatusFilterChange={setStatusFilter}
      typeFilter={typeFilter}
      onTypeFilterChange={setTypeFilter}
      publishedCount={announcements.filter((announcement) => announcement.status === 'Terbit').length}
      scheduledCount={announcements.filter((announcement) => announcement.status === 'Terjadwal').length}
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
