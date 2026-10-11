'use client';

import { useMemo, useState, type FormEvent } from 'react';
import type { AdminGameForm, AdminGameStatusFilter, AdminGameView } from '../interfaces/admin-game.interface';
import { AdminGamesTemplate } from '../templates/AdminGames.template';

const seedGames: AdminGameView[] = [
  {
    id: 'game-1',
    name: 'Mobile Legends',
    slug: 'mobile-legends',
    platform: 'Mobile',
    serviceCount: 18,
    active: true,
    updatedAt: '11 Okt 2026',
  },
  {
    id: 'game-2',
    name: 'Free Fire',
    slug: 'free-fire',
    platform: 'Mobile',
    serviceCount: 12,
    active: true,
    updatedAt: '10 Okt 2026',
  },
  {
    id: 'game-3',
    name: 'Roblox',
    slug: 'roblox',
    platform: 'Mobile',
    serviceCount: 9,
    active: true,
    updatedAt: '9 Okt 2026',
  },
  {
    id: 'game-4',
    name: 'Valorant',
    slug: 'valorant',
    platform: 'PC',
    serviceCount: 7,
    active: true,
    updatedAt: '8 Okt 2026',
  },
  {
    id: 'game-5',
    name: 'Genshin Impact',
    slug: 'genshin-impact',
    platform: 'Mobile',
    serviceCount: 6,
    active: false,
    updatedAt: '6 Okt 2026',
  },
  {
    id: 'game-6',
    name: 'PUBG Mobile',
    slug: 'pubg-mobile',
    platform: 'Mobile',
    serviceCount: 8,
    active: true,
    updatedAt: '5 Okt 2026',
  },
];

const emptyForm: AdminGameForm = { name: '', slug: '', platform: 'Mobile', serviceCount: 0, active: true };
const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export const AdminGamesPage = () => {
  const [query, setQuery] = useState('');
  const [games, setGames] = useState(seedGames);
  const [statusFilter, setStatusFilter] = useState<AdminGameStatusFilter>('Semua');
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AdminGameForm>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<AdminGameView | null>(null);

  const filteredGames = useMemo(
    () =>
      games.filter((game) => {
        const matchesQuery = `${game.name} ${game.slug} ${game.platform}`.toLowerCase().includes(query.toLowerCase());
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
      platform: game.platform,
      serviceCount: game.serviceCount,
      active: game.active,
    });
    setFormMode('edit');
  };

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextGame = { ...form, name: form.name.trim(), slug: slugify(form.slug || form.name), updatedAt: 'Baru saja' };
    if (formMode === 'edit' && editingId) {
      setGames((current) => current.map((game) => (game.id === editingId ? { ...game, ...nextGame } : game)));
    } else {
      setGames((current) => [{ id: `game-${Date.now()}`, ...nextGame }, ...current]);
    }
    setFormMode(null);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setGames((current) => current.filter((game) => game.id !== deleteTarget.id));
    setDeleteTarget(null);
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
    />
  );
};
