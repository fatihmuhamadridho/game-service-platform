'use client';

import { useMemo, useState } from 'react';
import type { GameCardView } from '../interfaces/game.interface';
import { GamesTemplate } from '../templates/Games.template';

const games: GameCardView[] = [
  {
    name: 'Mobile Legends',
    art: 'ml',
    tags: ['Top Up', 'Joki Rank', 'Akun'],
    count: 124,
    rating: '4.9',
    reviews: 1200,
  },
  { name: 'Valorant', art: 'valo', tags: ['Top Up', 'Joki Rank'], count: 48, rating: '4.8', reviews: 532 },
  { name: 'PUBG Mobile', art: 'pubg', tags: ['Top Up', 'Joki Rank', 'Akun'], count: 72, rating: '4.8', reviews: 641 },
  { name: 'Free Fire', art: 'ff', tags: ['Top Up', 'Joki Rank'], count: 56, rating: '4.7', reviews: 420 },
  { name: 'Roblox', art: 'roblox', tags: ['Top Up', 'Akun'], count: 36, rating: '4.7', reviews: 310 },
  { name: 'Genshin Impact', art: 'genshin', tags: ['Top Up', 'Joki Rank'], count: 28, rating: '4.8', reviews: 298 },
  { name: 'Honkai Star Rail', art: 'hsr', tags: ['Top Up', 'Joki Rank'], count: 20, rating: '4.7', reviews: 210 },
  { name: 'Call of Duty Mobile', art: 'cod', tags: ['Top Up', 'Joki Rank'], count: 18, rating: '4.6', reviews: 180 },
  { name: 'EA FC Mobile', art: 'fc', tags: ['Top Up', 'Joki Rank'], count: 16, rating: '4.6', reviews: 95 },
  { name: 'eFootball', art: 'efootball', tags: ['Top Up', 'Joki Rank'], count: 12, rating: '4.5', reviews: 80 },
  { name: 'Minecraft', art: 'minecraft', tags: ['Top Up', 'Akun'], count: 10, rating: '4.5', reviews: 76 },
  { name: 'Ragnarok Origin', art: 'ragnarok', tags: ['Top Up', 'Joki Rank'], count: 8, rating: '4.4', reviews: 60 },
  { name: 'League of Legends', art: 'lol', tags: ['Top Up', 'Joki Rank'], count: 14, rating: '4.7', reviews: 102 },
  { name: 'Arena of Valor', art: 'aov', tags: ['Top Up', 'Joki Rank'], count: 9, rating: '4.5', reviews: 64 },
  { name: 'Steam', art: 'steam', tags: ['Voucher', 'Akun'], count: 21, rating: '4.8', reviews: 190 },
  { name: 'Clash of Clans', art: 'coc', tags: ['Top Up', 'Joki Rank'], count: 11, rating: '4.6', reviews: 87 },
];
const filters = ['Semua', 'Mobile', 'PC', 'Console', 'Top Up', 'Joki Rank', 'Akun', 'Voucher', 'Lainnya'];
const categoryCounts: Record<string, number> = {
  Semua: 24,
  Mobile: 12,
  PC: 6,
  Console: 2,
  'Top Up': 18,
  'Joki Rank': 15,
  Akun: 4,
  Voucher: 3,
  Lainnya: 2,
};

export const GamesPage = () => {
  const [activeFilter, setActiveFilter] = useState('Semua');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('Paling Populer');
  const [page, setPage] = useState(1);
  const visibleGames = useMemo(() => {
    const matching = games.filter(
      (game) =>
        game.name.toLowerCase().includes(search.toLowerCase()) &&
        (activeFilter === 'Semua' ||
          !['Top Up', 'Joki Rank', 'Akun', 'Voucher'].includes(activeFilter) ||
          game.tags.includes(activeFilter))
    );
    if (sort === 'Rating Tertinggi') matching.sort((a, b) => Number(b.rating) - Number(a.rating));
    if (sort === 'Nama A–Z') matching.sort((a, b) => a.name.localeCompare(b.name));
    return matching;
  }, [activeFilter, search, sort]);
  const chooseFilter = (filter: string) => {
    setActiveFilter(filter);
    setPage(1);
  };
  const updateSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };
  return (
    <GamesTemplate
      games={visibleGames}
      filters={filters}
      counts={categoryCounts}
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
