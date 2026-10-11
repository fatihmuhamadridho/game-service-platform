'use client';

import { useMemo, useState } from 'react';
import type { ActivityCategory, ActivityLogView } from '../interfaces/admin-activity-log.interface';
import { AdminActivityLogsTemplate } from '../templates/AdminActivityLogs.template';

const seedLogs: ActivityLogView[] = [
  {
    id: 'log-1',
    adminName: 'Fatih Muhamad Ridho',
    adminEmail: 'fatih@example.com',
    action: 'Memperbarui layanan',
    target: 'Mobile Legends — Rank Boost',
    category: 'Produk',
    occurredAt: '2026-10-11T10:42:00',
    ipAddress: '192.0.2.14',
    result: 'Berhasil',
  },
  {
    id: 'log-2',
    adminName: 'Nadia Prameswari',
    adminEmail: 'nadia@example.com',
    action: 'Mengubah status pesanan',
    target: 'JH-2026-001248',
    category: 'Pesanan',
    occurredAt: '2026-10-11T09:18:00',
    ipAddress: '192.0.2.28',
    result: 'Berhasil',
  },
  {
    id: 'log-3',
    adminName: 'Dewi Lestari',
    adminEmail: 'dewi@example.com',
    action: 'Menambahkan banner',
    target: 'Promo Akhir Pekan',
    category: 'Konten',
    occurredAt: '2026-10-10T16:42:00',
    ipAddress: '192.0.2.39',
    result: 'Berhasil',
  },
  {
    id: 'log-4',
    adminName: 'Arif Ramadhan',
    adminEmail: 'arif@example.com',
    action: 'Memperbarui data pengguna',
    target: 'user-1024',
    category: 'Pengguna',
    occurredAt: '2026-10-10T14:18:00',
    ipAddress: '192.0.2.51',
    result: 'Gagal',
  },
  {
    id: 'log-5',
    adminName: 'Fatih Muhamad Ridho',
    adminEmail: 'fatih@example.com',
    action: 'Mengubah pengaturan platform',
    target: 'Mode pemeliharaan',
    category: 'Pengaturan',
    occurredAt: '2026-10-09T11:05:00',
    ipAddress: '192.0.2.14',
    result: 'Berhasil',
  },
];

export const AdminActivityLogsPage = () => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<ActivityCategory>('Semua Kategori');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const filteredLogs = useMemo(
    () =>
      seedLogs.filter((log) => {
        const searchable =
          `${log.adminName} ${log.adminEmail} ${log.action} ${log.target} ${log.ipAddress}`.toLowerCase();
        const day = log.occurredAt.slice(0, 10);
        return (
          searchable.includes(query.toLowerCase()) &&
          (category === 'Semua Kategori' || log.category === category) &&
          (!dateFrom || day >= dateFrom) &&
          (!dateTo || day <= dateTo)
        );
      }),
    [query, category, dateFrom, dateTo]
  );
  return (
    <AdminActivityLogsTemplate
      logs={filteredLogs}
      totalCount={seedLogs.length}
      query={query}
      onQueryChange={setQuery}
      category={category}
      onCategoryChange={setCategory}
      dateFrom={dateFrom}
      onDateFromChange={setDateFrom}
      dateTo={dateTo}
      onDateToChange={setDateTo}
    />
  );
};
