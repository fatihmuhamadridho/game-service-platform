'use client';

import { useMemo, useState } from 'react';
import type { AdminOrderStatus, AdminOrderStatusFilter, AdminOrderView } from '../interfaces/admin-order.interface';
import { AdminOrdersTemplate } from '../templates/AdminOrders.template';

const seedOrders: AdminOrderView[] = [
  {
    id: 'JH-2026-001248',
    customerName: 'Budi Santoso',
    whatsapp: '+6281234567890',
    game: 'Mobile Legends',
    service: 'Top Up 86 Diamonds',
    gameAccount: 'Player12345',
    server: '1234',
    amount: 25000,
    status: 'Menunggu Validasi',
    paymentMethod: 'QRIS',
    paymentStatus: 'Menunggu Validasi',
    createdAt: '2026-10-11T09:42:00',
  },
  {
    id: 'JH-2026-001247',
    customerName: 'Santos98',
    whatsapp: '+6282234567890',
    game: 'Free Fire',
    service: 'Top Up 140 Diamonds',
    gameAccount: 'FFPlayer98',
    server: 'Global',
    amount: 20000,
    status: 'Diproses',
    paymentMethod: 'BCA Virtual Account',
    paymentStatus: 'Dibayar',
    createdAt: '2026-10-11T08:10:00',
  },
  {
    id: 'JH-2026-001246',
    customerName: 'Indah Putri',
    whatsapp: '+6281334567890',
    game: 'Roblox',
    service: 'Joki Rank Bronze → Silver',
    gameAccount: 'indah_play',
    server: 'Global',
    amount: 75000,
    status: 'Selesai',
    paymentMethod: 'QRIS',
    paymentStatus: 'Dibayar',
    createdAt: '2026-10-10T18:25:00',
  },
  {
    id: 'JH-2026-001245',
    customerName: 'Rakassa',
    whatsapp: '+6285234567890',
    game: 'Valorant',
    service: 'Top Up 475 VP',
    gameAccount: 'rakassa#ID1',
    server: 'Asia Pacific',
    amount: 52000,
    status: 'Menunggu Pembayaran',
    paymentMethod: 'QRIS',
    paymentStatus: 'Belum Dibayar',
    createdAt: '2026-10-10T17:40:00',
  },
  {
    id: 'JH-2026-001244',
    customerName: 'Dimas Aja',
    whatsapp: '+6287734567890',
    game: 'Genshin Impact',
    service: 'Blessing of the Welkin Moon',
    gameAccount: 'dimasaja',
    server: 'Asia',
    amount: 79000,
    status: 'Dibatalkan',
    paymentMethod: 'BCA Virtual Account',
    paymentStatus: 'Gagal',
    createdAt: '2026-10-10T15:10:00',
  },
];
const formatRupiah = (amount: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);

export const AdminOrdersPage = () => {
  const [orders, setOrders] = useState(seedOrders);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AdminOrderStatusFilter>('Semua Status');
  const [detailOrder, setDetailOrder] = useState<AdminOrderView | null>(null);
  const filteredOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          `${order.id} ${order.customerName} ${order.whatsapp} ${order.game} ${order.service}`
            .toLowerCase()
            .includes(query.toLowerCase()) &&
          (statusFilter === 'Semua Status' || order.status === statusFilter)
      ),
    [orders, query, statusFilter]
  );
  const updateStatus = (orderId: string, status: AdminOrderStatus) => {
    setOrders((current) => current.map((order) => (order.id === orderId ? { ...order, status } : order)));
    setDetailOrder((current) => (current?.id === orderId ? { ...current, status } : current));
  };
  return (
    <AdminOrdersTemplate
      orders={orders}
      filteredOrders={filteredOrders}
      query={query}
      onQueryChange={setQuery}
      statusFilter={statusFilter}
      onStatusFilterChange={setStatusFilter}
      onView={setDetailOrder}
      onStatusChange={updateStatus}
      formatRupiah={formatRupiah}
      detailOrder={detailOrder}
      onCloseDetail={() => setDetailOrder(null)}
    />
  );
};
