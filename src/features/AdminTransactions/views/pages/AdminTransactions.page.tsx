'use client';

import { useMemo, useState } from 'react';
import type {
  TransactionMethodFilter,
  TransactionStatusFilter,
  TransactionView,
} from '../interfaces/admin-transaction.interface';
import { AdminTransactionsTemplate } from '../templates/AdminTransactions.template';

const seedTransactions: TransactionView[] = [
  {
    id: 'TRX-2026-00981',
    orderId: 'JH-2026-001248',
    customerName: 'Budi Santoso',
    customerContact: '+6281234567890',
    type: 'Pembayaran Pesanan',
    method: 'QRIS',
    amount: 25000,
    status: 'Berhasil',
    providerReference: 'QR-928381-AB',
    createdAt: '2026-10-11T09:42:00',
    settledAt: '2026-10-11T09:43:15',
  },
  {
    id: 'TRX-2026-00980',
    orderId: 'JH-2026-001247',
    customerName: 'Santos98',
    customerContact: '+6282234567890',
    type: 'Pembayaran Pesanan',
    method: 'BCA Virtual Account',
    amount: 20000,
    status: 'Menunggu',
    providerReference: 'BCA-VA-2026101180',
    createdAt: '2026-10-11T08:10:00',
    settledAt: '',
  },
  {
    id: 'TRX-2026-00979',
    orderId: 'JH-2026-001246',
    customerName: 'Indah Putri',
    customerContact: '+6281334567890',
    type: 'Pembayaran Pesanan',
    method: 'QRIS',
    amount: 75000,
    status: 'Berhasil',
    providerReference: 'QR-927640-CD',
    createdAt: '2026-10-10T18:25:00',
    settledAt: '2026-10-10T18:26:10',
  },
  {
    id: 'TRX-2026-00978',
    orderId: 'JH-2026-001245',
    customerName: 'Rakassa',
    customerContact: '+6285234567890',
    type: 'Pembayaran Pesanan',
    method: 'QRIS',
    amount: 52000,
    status: 'Gagal',
    providerReference: 'QR-927512-EF',
    createdAt: '2026-10-10T17:40:00',
    settledAt: '',
  },
  {
    id: 'TRX-2026-00977',
    orderId: 'JH-2026-001188',
    customerName: 'Dimas Aja',
    customerContact: '+6287734567890',
    type: 'Refund',
    method: 'BCA Virtual Account',
    amount: 52000,
    status: 'Dikembalikan',
    providerReference: 'RF-BCA-2026100977',
    createdAt: '2026-10-09T09:30:00',
    settledAt: '2026-10-09T12:10:00',
  },
];
const formatRupiah = (amount: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);

export const AdminTransactionsPage = () => {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TransactionStatusFilter>('Semua Status');
  const [methodFilter, setMethodFilter] = useState<TransactionMethodFilter>('Semua Metode');
  const [detailTarget, setDetailTarget] = useState<TransactionView | null>(null);
  const filteredTransactions = useMemo(
    () =>
      seedTransactions.filter(
        (transaction) =>
          `${transaction.id} ${transaction.orderId} ${transaction.customerName} ${transaction.customerContact} ${transaction.providerReference}`
            .toLowerCase()
            .includes(query.toLowerCase()) &&
          (statusFilter === 'Semua Status' || transaction.status === statusFilter) &&
          (methodFilter === 'Semua Metode' || transaction.method === methodFilter)
      ),
    [query, statusFilter, methodFilter]
  );
  return (
    <AdminTransactionsTemplate
      transactions={filteredTransactions}
      totalCount={seedTransactions.length}
      query={query}
      onQueryChange={setQuery}
      statusFilter={statusFilter}
      onStatusFilterChange={setStatusFilter}
      methodFilter={methodFilter}
      onMethodFilterChange={setMethodFilter}
      detailTarget={detailTarget}
      onView={setDetailTarget}
      onCloseDetail={() => setDetailTarget(null)}
      formatRupiah={formatRupiah}
    />
  );
};
