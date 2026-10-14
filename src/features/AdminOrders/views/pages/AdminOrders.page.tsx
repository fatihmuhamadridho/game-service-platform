'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AdminOrderStatusFilter, AdminOrderView } from '../interfaces/admin-order.interface';
import { AdminOrdersTemplate } from '../templates/AdminOrders.template';

type ApiOrder = AdminOrderView;
const formatRupiah = (amount: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);

export const AdminOrdersPage = () => {
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AdminOrderStatusFilter>('Semua Status');
  const [detailOrder, setDetailOrder] = useState<AdminOrderView | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: '1',
        pageSize: '100',
        ...(query ? { search: query } : {}),
        ...(statusFilter !== 'Semua Status' ? { status: statusFilter } : {}),
      });
      const response = await fetch(`/api/admin/orders/v1/list?${params}`, { cache: 'no-store' });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.status?.message ?? 'Gagal memuat pesanan.');
      setOrders(payload.data.orders as ApiOrder[]);
      setError('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Gagal memuat pesanan.');
    } finally {
      setLoading(false);
    }
  }, [query, statusFilter]);
  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);
  const filteredOrders = useMemo(() => orders, [orders]);
  const viewOrder = async (order: AdminOrderView) => {
    try {
      const response = await fetch(`/api/admin/orders/v1/detail/${order.internalId}`, { cache: 'no-store' });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.status?.message ?? 'Gagal memuat detail pesanan.');
      const detail = payload.data.order;
      const first = detail.items?.[0];
      setDetailOrder({
        ...order,
        gameAccount: first?.gameAccount ?? '',
        server: first?.gameServer ?? '',
        proofs: detail.proofs ?? [],
        paymentId: detail.payments?.[0]?.id,
      });
      setError('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Gagal memuat detail pesanan.');
    }
  };
  const reviewPayment = async (paymentId: string, decision: 'APPROVE' | 'REJECT', note: string) => {
    if (!detailOrder) return;
    const response = await fetch('/api/admin/orders/v1/payment-review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: detailOrder.internalId, paymentId, decision, note }),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.status?.message ?? 'Pemeriksaan pembayaran gagal disimpan.');
    setDetailOrder(null);
    await load();
  };
  const completeOrder = async (orderId: string) => {
    const response = await fetch(`/api/admin/orders/v1/complete/${encodeURIComponent(orderId)}`, { method: 'POST' });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.status?.message ?? 'Status pesanan gagal diperbarui.');
    setDetailOrder(null);
    await load();
  };
  return (
    <AdminOrdersTemplate
      orders={orders}
      filteredOrders={filteredOrders}
      query={query}
      onQueryChange={setQuery}
      statusFilter={statusFilter}
      onStatusFilterChange={setStatusFilter}
      onView={viewOrder}
      formatRupiah={formatRupiah}
      detailOrder={detailOrder}
      onCloseDetail={() => setDetailOrder(null)}
      onReview={reviewPayment}
      onComplete={completeOrder}
      error={error}
      loading={loading}
    />
  );
};
