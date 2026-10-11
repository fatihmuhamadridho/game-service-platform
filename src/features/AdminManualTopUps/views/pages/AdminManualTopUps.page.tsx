'use client';

import { useMemo, useState } from 'react';
import type {
  ManualTopUpStatus,
  ManualTopUpStatusFilter,
  ManualTopUpView,
} from '../interfaces/admin-manual-top-up.interface';
import { AdminManualTopUpsTemplate } from '../templates/AdminManualTopUps.template';

const seedRequests: ManualTopUpView[] = [
  {
    id: 'MT-2026-00138',
    customerName: 'Nadia Putri',
    whatsapp: '+6281234567890',
    game: 'Mobile Legends',
    accountId: 'nadia_player',
    server: '1234',
    packageName: '86 Diamonds',
    amount: 25000,
    paymentMethod: 'Transfer BCA',
    paymentReference: 'TRX-BCA-930248',
    notes: 'Mohon diproses sebelum malam.',
    status: 'Menunggu',
    createdAt: '2026-10-11T09:42:00',
  },
  {
    id: 'MT-2026-00137',
    customerName: 'Rizky A',
    whatsapp: '+6282234567890',
    game: 'Free Fire',
    accountId: 'FF-Rizky77',
    server: 'Global',
    packageName: '140 Diamonds',
    amount: 20000,
    paymentMethod: 'QRIS',
    paymentReference: 'QR-880173',
    notes: '',
    status: 'Diproses',
    createdAt: '2026-10-11T08:10:00',
  },
  {
    id: 'MT-2026-00136',
    customerName: 'Indah Putri',
    whatsapp: '+6281334567890',
    game: 'Genshin Impact',
    accountId: 'indah_traveler',
    server: 'Asia',
    packageName: 'Blessing of the Welkin Moon',
    amount: 79000,
    paymentMethod: 'Transfer BCA',
    paymentReference: 'TRX-BCA-930102',
    notes: '',
    status: 'Selesai',
    createdAt: '2026-10-10T18:25:00',
  },
  {
    id: 'MT-2026-00135',
    customerName: 'Dimas Aja',
    whatsapp: '+6287734567890',
    game: 'Valorant',
    accountId: 'dimas#ID1',
    server: 'Asia Pacific',
    packageName: '475 VP',
    amount: 52000,
    paymentMethod: 'QRIS',
    paymentReference: 'QR-879982',
    notes: 'Bukti pembayaran kurang jelas.',
    status: 'Ditolak',
    createdAt: '2026-10-10T17:40:00',
  },
];
const formatRupiah = (amount: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);

export const AdminManualTopUpsPage = () => {
  const [requests, setRequests] = useState(seedRequests);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ManualTopUpStatusFilter>('Semua Status');
  const [detailTarget, setDetailTarget] = useState<ManualTopUpView | null>(null);
  const filteredRequests = useMemo(
    () =>
      requests.filter(
        (request) =>
          `${request.id} ${request.customerName} ${request.whatsapp} ${request.game} ${request.accountId}`
            .toLowerCase()
            .includes(query.toLowerCase()) &&
          (statusFilter === 'Semua Status' || request.status === statusFilter)
      ),
    [requests, query, statusFilter]
  );
  const changeStatus = (id: string, status: ManualTopUpStatus) => {
    setRequests((current) => current.map((request) => (request.id === id ? { ...request, status } : request)));
    setDetailTarget((current) => (current?.id === id ? { ...current, status } : current));
  };
  return (
    <AdminManualTopUpsTemplate
      requests={requests}
      filteredRequests={filteredRequests}
      query={query}
      onQueryChange={setQuery}
      statusFilter={statusFilter}
      onStatusFilterChange={setStatusFilter}
      detailTarget={detailTarget}
      onView={setDetailTarget}
      onCloseDetail={() => setDetailTarget(null)}
      onStatusChange={changeStatus}
      formatRupiah={formatRupiah}
    />
  );
};
