'use client';

import { IconBolt, IconCheck, IconDeviceGamepad2, IconDiamond, IconShieldCheck, IconWallet } from '@tabler/icons-react';
import type { HomeBenefit, HomeCategory, HomeGame } from '../interfaces/homeV2.interface';
import { HomeV2Template } from '../templates/HomeV2.template';

const games: HomeGame[] = [
  { name: 'Roblox', service: 'Joki Rank / Star', art: 'roblox', mark: 'R' },
  { name: 'Mobile Legends', service: 'Joki Rank / Top Up', art: 'ml', mark: '✦' },
  { name: 'Free Fire', service: 'Top Up Diamond', art: 'ff', mark: '◈' },
  { name: 'PUBG Mobile', service: 'Joki Rank / Top Up', art: 'pubg', mark: 'P' },
  { name: 'Valorant', service: 'Top Up Point', art: 'valo', mark: 'V' },
  { name: 'Genshin Impact', service: 'Top Up Genesis', art: 'genshin', mark: '✧' },
];

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
  return <HomeV2Template games={games} categories={categories} benefits={benefits} />;
};
