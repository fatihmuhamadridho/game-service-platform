'use client';

import { useEffect, useState } from 'react';
import type { GameCardView } from '../interfaces/game.interface';
import { GamesTemplate } from '../templates/Games.template';

export const GamesPage = () => {
  const [activeFilter, setActiveFilter] = useState('Semua');
  const [activeCategorySlug, setActiveCategorySlug] = useState('');
  const [serviceCategories, setServiceCategories] = useState<Array<{ name: string; slug: string; count: number }>>([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('Paling Populer');
  const [page, setPage] = useState(1);
  const [games, setGames] = useState<GameCardView[]>([]);
  const [total, setTotal] = useState(0);
  const [loadError, setLoadError] = useState('');
  useEffect(() => {
    let alive = true;
    const query = new URLSearchParams({
      search,
      limit: '100',
      offset: '0',
      sort: sort === 'Nama A–Z' ? 'NAME_ASC' : 'POPULAR',
    });
    if (activeCategorySlug) query.set('category', activeCategorySlug);
    fetch(`/api/games/v1/list?${query}`)
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !result.data) throw new Error(result.status?.message ?? 'Katalog game gagal dimuat.');
        if (!alive) return;
        const totalItems: number = result.data.pagination.total;
        const allGames = [...result.data.games];
        while (allGames.length < totalItems) {
          const nextQuery = new URLSearchParams(query);
          nextQuery.set('offset', String(allGames.length));
          const nextResponse = await fetch(`/api/games/v1/list?${nextQuery}`);
          const nextResult = await nextResponse.json();
          if (!nextResponse.ok || !nextResult.data) {
            throw new Error(nextResult.status?.message ?? 'Katalog game gagal dimuat.');
          }
          if (!nextResult.data.games.length) break;
          allGames.push(...nextResult.data.games);
        }
        if (!alive) return;
        setTotal(totalItems);
        setServiceCategories(result.data.filters?.serviceCategories ?? []);
        setGames(
          allGames.map(
            (game: {
              id: string;
              slug: string;
              name: string;
              artworkKey: string | null;
              serviceCount: number;
              categories?: Array<{ name: string }>;
            }) => ({
              id: game.id,
              slug: game.slug,
              name: game.name,
              art: game.artworkKey ?? game.slug,
              tags: game.categories?.map((category) => category.name) ?? [],
              count: game.serviceCount,
              rating: '',
              reviews: 0,
            })
          )
        );
        setLoadError('');
      })
      .catch(
        (error: unknown) => alive && setLoadError(error instanceof Error ? error.message : 'Katalog game gagal dimuat.')
      );
    return () => {
      alive = false;
    };
  }, [search, sort, activeCategorySlug]);
  const filters = ['Semua', ...serviceCategories.map((category) => category.name)];
  const categoryCounts: Record<string, number> = {
    Semua: total,
    ...Object.fromEntries(serviceCategories.map((category) => [category.name, category.count])),
  };
  const chooseFilter = (filter: string) => {
    setActiveFilter(filter);
    setActiveCategorySlug(serviceCategories.find((category) => category.name === filter)?.slug ?? '');
    setPage(1);
  };
  const updateSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };
  return (
    <GamesTemplate
      loadError={loadError}
      games={games}
      filters={filters}
      counts={{ ...categoryCounts, Semua: total }}
      activeFilter={activeFilter}
      search={search}
      sort={sort}
      page={page}
      onSearch={updateSearch}
      onFilter={chooseFilter}
      onSort={setSort}
      onPage={setPage}
    />
  );
};
