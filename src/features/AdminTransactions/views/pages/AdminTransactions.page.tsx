'use client';

import { useCallback, useEffect, useState } from 'react';
import type {
  TransactionMethodFilter,
  TransactionStatusFilter,
  TransactionView,
} from '../interfaces/admin-transaction.interface';
import { AdminTransactionsTemplate } from '../templates/AdminTransactions.template';

const formatRupiah = (amount: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);

export const AdminTransactionsPage = () => {
  const [transactions, setTransactions] = useState<TransactionView[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TransactionStatusFilter>('Semua Status');
  const [methodFilter, setMethodFilter] = useState<TransactionMethodFilter>('Semua Metode');
  const [detailTarget, setDetailTarget] = useState<TransactionView | null>(null);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: '1',
        pageSize: '100',
        ...(query ? { search: query } : {}),
        ...(statusFilter !== 'Semua Status' ? { status: statusFilter } : {}),
        ...(methodFilter !== 'Semua Metode' ? { method: methodFilter } : {}),
      });
      const response = await fetch(`/api/admin/transactions/v1/list?${params}`, { cache: 'no-store' });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.status?.message ?? 'Gagal memuat transaksi.');
      setTransactions(payload.data.transactions as TransactionView[]);
      setTotalCount(payload.data.total);
      setError('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Gagal memuat transaksi.');
    }
  }, [query, statusFilter, methodFilter]);
  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);
  const viewTransaction = async (transaction: TransactionView) => {
    try {
      const response = await fetch(`/api/admin/transactions/v1/detail/${transaction.internalId}`, {
        cache: 'no-store',
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.status?.message ?? 'Gagal memuat detail transaksi.');
      setDetailTarget(payload.data.transaction as TransactionView);
      setError('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Gagal memuat detail transaksi.');
    }
  };
  return (
    <AdminTransactionsTemplate
      transactions={transactions}
      totalCount={totalCount}
      query={query}
      onQueryChange={setQuery}
      statusFilter={statusFilter}
      onStatusFilterChange={setStatusFilter}
      methodFilter={methodFilter}
      onMethodFilterChange={setMethodFilter}
      detailTarget={detailTarget}
      onView={viewTransaction}
      onCloseDetail={() => setDetailTarget(null)}
      formatRupiah={formatRupiah}
      error={error}
    />
  );
};
