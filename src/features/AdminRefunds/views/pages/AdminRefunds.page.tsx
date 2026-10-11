'use client';

import { useMemo, useState } from 'react';
import type { RefundStatus, RefundStatusFilter, RefundView } from '../interfaces/admin-refund.interface';
import { AdminRefundsTemplate } from '../templates/AdminRefunds.template';

const seedRefunds: RefundView[] = [
  {
    id: 'RF-2026-00042',
    orderId: 'JH-2026-001238',
    customerName: 'Alya Putri',
    whatsapp: '+6281234567890',
    game: 'Mobile Legends',
    service: 'Top Up 86 Diamonds',
    amount: 25000,
    paymentMethod: 'QRIS',
    reason: 'Diamond belum masuk setelah pembayaran terkonfirmasi.',
    adminNote: '',
    status: 'Menunggu Review',
    requestedAt: '2026-10-11T10:20:00',
  },
  {
    id: 'RF-2026-00041',
    orderId: 'JH-2026-001219',
    customerName: 'Rizky A',
    whatsapp: '+6282234567890',
    game: 'Free Fire',
    service: 'Top Up 140 Diamonds',
    amount: 20000,
    paymentMethod: 'BCA Virtual Account',
    reason: 'Salah memasukkan ID akun game.',
    adminNote: 'Sudah dikonfirmasi dengan pelanggan.',
    status: 'Disetujui',
    requestedAt: '2026-10-10T16:12:00',
  },
  {
    id: 'RF-2026-00040',
    orderId: 'JH-2026-001202',
    customerName: 'Indah Putri',
    whatsapp: '+6281334567890',
    game: 'Roblox',
    service: 'Joki Rank Bronze → Silver',
    amount: 75000,
    paymentMethod: 'QRIS',
    reason: 'Ingin membatalkan pesanan.',
    adminNote: 'Layanan sudah mulai dikerjakan.',
    status: 'Ditolak',
    requestedAt: '2026-10-10T12:48:00',
  },
  {
    id: 'RF-2026-00039',
    orderId: 'JH-2026-001188',
    customerName: 'Dimas Aja',
    whatsapp: '+6287734567890',
    game: 'Valorant',
    service: 'Top Up 475 VP',
    amount: 52000,
    paymentMethod: 'QRIS',
    reason: 'Transaksi ganda.',
    adminNote: 'Dana dikembalikan ke metode pembayaran asal.',
    status: 'Selesai',
    requestedAt: '2026-10-09T09:30:00',
  },
];
const formatRupiah = (amount: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);

export const AdminRefundsPage = () => {
  const [refunds, setRefunds] = useState(seedRefunds);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<RefundStatusFilter>('Semua Status');
  const [detailTarget, setDetailTarget] = useState<RefundView | null>(null);
  const filteredRefunds = useMemo(
    () =>
      refunds.filter(
        (refund) =>
          `${refund.id} ${refund.orderId} ${refund.customerName} ${refund.whatsapp} ${refund.game}`
            .toLowerCase()
            .includes(query.toLowerCase()) &&
          (statusFilter === 'Semua Status' || refund.status === statusFilter)
      ),
    [refunds, query, statusFilter]
  );
  const changeStatus = (id: string, status: RefundStatus, adminNote: string) => {
    setRefunds((current) => current.map((refund) => (refund.id === id ? { ...refund, status, adminNote } : refund)));
    setDetailTarget((current) => (current?.id === id ? { ...current, status, adminNote } : current));
  };
  return (
    <AdminRefundsTemplate
      refunds={refunds}
      filteredRefunds={filteredRefunds}
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
