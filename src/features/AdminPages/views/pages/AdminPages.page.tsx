'use client';

import { useMemo, useState, type FormEvent } from 'react';
import type { AdminPageForm, AdminPageStatusFilter, AdminPageView } from '../interfaces/admin-page.interface';
import { AdminPagesTemplate } from '../templates/AdminPages.template';

const seedPages: AdminPageView[] = [
  {
    id: 'page-1',
    title: 'Tentang Kami',
    slug: 'tentang-kami',
    summary: 'Informasi tentang JokiHub dan layanan platform.',
    content: 'JokiHub menyediakan layanan game dan top up untuk pengguna.',
    status: 'Published',
    updatedAt: '11 Okt 2026',
  },
  {
    id: 'page-2',
    title: 'Syarat & Ketentuan',
    slug: 'syarat-ketentuan',
    summary: 'Ketentuan penggunaan layanan JokiHub.',
    content: 'Ketentuan penggunaan layanan JokiHub.',
    status: 'Published',
    updatedAt: '9 Okt 2026',
  },
  {
    id: 'page-3',
    title: 'Kebijakan Privasi',
    slug: 'kebijakan-privasi',
    summary: 'Informasi pengelolaan data pengguna.',
    content: 'Kebijakan privasi untuk penggunaan layanan JokiHub.',
    status: 'Draft',
    updatedAt: '7 Okt 2026',
  },
];
const emptyForm: AdminPageForm = { title: '', slug: '', summary: '', content: '', status: 'Draft' };
const makeSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s-]+/g, '-');

export const AdminPagesPage = () => {
  const [pages, setPages] = useState(seedPages);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AdminPageStatusFilter>('Semua Status');
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AdminPageForm>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<AdminPageView | null>(null);

  const filteredPages = useMemo(
    () =>
      pages.filter((page) => {
        const matchesQuery = `${page.title} ${page.slug} ${page.summary}`.toLowerCase().includes(query.toLowerCase());
        return matchesQuery && (statusFilter === 'Semua Status' || page.status === statusFilter);
      }),
    [pages, query, statusFilter]
  );

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setFormMode('create');
  };
  const openEdit = (page: AdminPageView) => {
    setEditingId(page.id);
    setForm({ title: page.title, slug: page.slug, summary: page.summary, content: page.content, status: page.status });
    setFormMode('edit');
  };
  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = {
      ...form,
      title: form.title.trim(),
      slug: makeSlug(form.slug || form.title),
      summary: form.summary.trim(),
      content: form.content.trim(),
      updatedAt: 'Baru saja',
    };
    if (formMode === 'edit' && editingId)
      setPages((current) => current.map((page) => (page.id === editingId ? { ...page, ...next } : page)));
    else setPages((current) => [{ id: `page-${Date.now()}`, ...next }, ...current]);
    setFormMode(null);
  };
  const confirmDelete = () => {
    if (!deleteTarget) return;
    setPages((current) => current.filter((page) => page.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <AdminPagesTemplate
      pages={pages}
      filteredPages={filteredPages}
      query={query}
      onQueryChange={setQuery}
      statusFilter={statusFilter}
      onStatusFilterChange={setStatusFilter}
      publishedCount={pages.filter((page) => page.status === 'Published').length}
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
