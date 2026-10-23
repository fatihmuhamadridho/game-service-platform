'use client';

import { apiFetch } from '@services/apiFetch.service';

import { useEffect, useState } from 'react';
import { IconBolt, IconCheck, IconDeviceGamepad2, IconDiamond, IconShieldCheck, IconWallet } from '@tabler/icons-react';
import type { HomeBenefit, HomeCategory, HomeGame } from '../interfaces/homeV2.interface';
import { HomeV2Template } from '../templates/HomeV2.template';

const categories: HomeCategory[] = [
  { title: 'Joki Game', detail: 'Rank, Level, Achievement', icon: <IconDeviceGamepad2 /> },
  { title: 'Top Up Game', detail: 'Diamond, UC, Robux, dll', icon: <IconDiamond /> },
  { title: 'Voucher Game', detail: 'Membership, Battle Pass', icon: <IconWallet /> },
  { title: 'Pulsa & Paket Data', detail: 'Semua operator', icon: <IconBolt /> },
  { title: 'E-Wallet', detail: 'DANA, OVO, GoPay, dll', icon: <IconWallet /> },
  { title: 'Lainnya', detail: 'Steam, Netflix, dll', icon: <IconDiamond /> },
];

const benefits: HomeBenefit[] = [
  { title: 'Proses Super Cepat', detail: 'Pesanan diproses secepat mungkin', icon: <IconBolt /> },
  { title: '100% Aman', detail: 'Keamanan akun dan data kamu prioritas', icon: <IconShieldCheck /> },
  { title: 'Harga Terbaik', detail: 'Dapatkan harga paling kompetitif', icon: <IconDiamond /> },
  { title: 'Layanan 24/7', detail: 'Tim support siap membantu kapan saja', icon: <IconCheck /> },
];

export const HomeV2Page = () => {
  const [games, setGames] = useState<HomeGame[]>([]);
  const [liveCategories, setLiveCategories] = useState<HomeCategory[]>([]);
  useEffect(() => {
    let alive = true;
    apiFetch('/api/games/v1/popular', { credentials: 'omit' })
      .then((response) => response.json())
      .then(
        (result: {
          data?: {
            games?: Array<{ name: string; slug: string; serviceSummary: string | null; artworkKey: string | null }>;
          };
        }) => {
          if (alive)
            setGames(
              (result.data?.games ?? []).map((game) => ({
                name: game.name,
                slug: game.slug,
                service: game.serviceSummary ?? 'Lihat layanan tersedia',
                art: game.artworkKey ?? game.slug,
                mark: game.name.slice(0, 1),
              }))
            );
        }
      )
      .catch(() => alive && setGames([]));
    return () => {
      alive = false;
    };
  }, []);
  useEffect(() => {
    let alive = true;
    apiFetch('/api/service-categories/v1/list', { credentials: 'omit' })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !result.data) throw new Error('Kategori belum tersedia.');
        if (alive)
          setLiveCategories(
            result.data.categories.map((category: { name: string; description: string | null }, index: number) => ({
              title: category.name,
              detail: category.description ?? 'Jelajahi layanan yang tersedia',
              icon:
                index % categories.length < categories.length ? (
                  categories[index % categories.length]!.icon
                ) : (
                  <IconWallet />
                ),
            }))
          );
      })
      .catch(() => alive && setLiveCategories([]));
    return () => {
      alive = false;
    };
  }, []);
  return <HomeV2Template games={games} categories={liveCategories} benefits={benefits} />;
};
