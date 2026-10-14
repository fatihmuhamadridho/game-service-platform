'use client';

import { useMemo, useState, type FormEvent } from 'react';
import type { AdminGameForm, AdminGameStatusFilter, AdminGameView } from '../interfaces/admin-game.interface';
import { AdminGamesTemplate } from '../templates/AdminGames.template';

type Props = {
  initialGames: AdminGameView[];
  loadError?: string;
};

const emptyForm: AdminGameForm = {
  name: '',
  slug: '',
  serviceSummary: '',
  artworkKey: '',
  active: false,
  popular: false,
  sortOrder: 0,
};
const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export const AdminGamesClientPage = ({ initialGames, loadError }: Props) => {
  const [query, setQuery] = useState('');
  const [games] = useState(initialGames);
  const [statusFilter, setStatusFilter] = useState<AdminGameStatusFilter>('Semua');
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AdminGameForm>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<AdminGameView | null>(null);

  const filteredGames = useMemo(
    () =>
      games.filter((game) => {
        const matchesQuery = `${game.name} ${game.slug}`.toLowerCase().includes(query.toLowerCase());
        const matchesStatus = statusFilter === 'Semua' || (statusFilter === 'Aktif' ? game.active : !game.active);
        return matchesQuery && matchesStatus;
      }),
    [games, query, statusFilter]
  );

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setFormMode('create');
  };

  const openEdit = (game: AdminGameView) => {
    setEditingId(game.id);
    setForm({
      name: game.name,
      slug: game.slug,
      serviceSummary: game.serviceSummary ?? '',
      artworkKey: game.artworkKey ?? '',
      active: game.active,
      popular: game.popular,
      sortOrder: game.sortOrder,
    });
    setFormMode('edit');
  };

  const [actionError, setActionError] = useState('');
  const [saving, setSaving] = useState(false);
  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextGame = { ...form, name: form.name.trim(), slug: slugify(form.slug || form.name), updatedAt: 'Baru saja' };
    setSaving(true);
    setActionError('');
    try {
      const response = await fetch(
        formMode === 'edit' && editingId
          ? `/api/admin/games/v1/update/${encodeURIComponent(editingId)}`
          : '/api/admin/games/v1/create',
        {
          method: formMode === 'edit' ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: nextGame.name,
            slug: nextGame.slug,
            serviceSummary: nextGame.serviceSummary || null,
            artworkKey: nextGame.artworkKey || null,
            isActive: nextGame.active,
            isPopular: nextGame.popular,
            sortOrder: nextGame.sortOrder,
          }),
        }
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.status?.message ?? 'Perubahan tidak dapat disimpan.');
      setFormMode(null);
      window.location.reload();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Perubahan tidak dapat disimpan.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setActionError('');
    try {
      const response = await fetch(`/api/admin/games/v1/delete/${encodeURIComponent(deleteTarget.id)}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.status?.message ?? 'Game tidak dapat dihapus.');
      setDeleteTarget(null);
      window.location.reload();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Game tidak dapat dihapus.');
    }
  };

  return (
    <AdminGamesTemplate
      games={games}
      filteredGames={filteredGames}
      query={query}
      onQueryChange={setQuery}
      statusFilter={statusFilter}
      onStatusFilterChange={setStatusFilter}
      activeCount={games.filter((game) => game.active).length}
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
      loadError={loadError}
      actionError={actionError}
      saving={saving}
    />
  );
};
