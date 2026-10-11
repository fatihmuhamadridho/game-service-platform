'use client';

import { useMemo, useState } from 'react';
import type { PayoutStatus, PayoutStatusFilter, PayoutView } from '../interfaces/admin-payout.interface';
import { AdminPayoutsTemplate } from '../templates/AdminPayouts.template';

const seedPayouts: PayoutView[] = [
  {
    id: 'PO-2026-00071',
    partnerName: 'Raka Store',
    partnerContact: 'raka@example.com',
    amount: 1250000,
    bankName: 'BCA',
    accountNumber: '•••• •••• 4821',
    accountHolder: 'Raka Pratama',
    reference: 'WD-RK-102671',
    note: 'Pencairan komisi mingguan.',
    status: 'Menunggu Review',
    requestedAt: '2026-10-11T09:42:00',
    processedAt: '',
  },
  {
    id: 'PO-2026-00070',
    partnerName: 'Nadia Games',
    partnerContact: 'nadia@example.com',
    amount: 780000,
    bankName: 'Mandiri',
    accountNumber: '•••• •••• 1732',
    accountHolder: 'Nadia Putri',
    reference: 'WD-NG-102670',
    note: '',
    status: 'Diproses',
    requestedAt: '2026-10-10T14:18:00',
    processedAt: '',
  },
  {
    id: 'PO-2026-00069',
    partnerName: 'Dewa Top Up',
    partnerContact: 'dewa@example.com',
    amount: 2400000,
    bankName: 'BNI',
    accountNumber: '•••• •••• 9255',
    accountHolder: 'Dewa Saputra',
    reference: 'WD-DT-102669',
    note: 'Pencairan saldo partner.',
    status: 'Berhasil',
    requestedAt: '2026-10-09T11:05:00',
    processedAt: '2026-10-09T13:20:00',
  },
  {
    id: 'PO-2026-00068',
    partnerName: 'Pixel Shop',
    partnerContact: 'pixel@example.com',
    amount: 500000,
    bankName: 'BRI',
    accountNumber: '•••• •••• 3014',
    accountHolder: 'Pixel Ananda',
    reference: 'WD-PS-102668',
    note: 'Nama pemilik rekening tidak cocok.',
    status: 'Ditolak',
    requestedAt: '2026-10-08T16:55:00',
    processedAt: '2026-10-08T17:30:00',
  },
];
const formatRupiah = (amount: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);

export const AdminPayoutsPage = () => {
  const [payouts, setPayouts] = useState(seedPayouts);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PayoutStatusFilter>('Semua Status');
  const [detailTarget, setDetailTarget] = useState<PayoutView | null>(null);
  const filteredPayouts = useMemo(
    () =>
      payouts.filter(
        (payout) =>
          `${payout.id} ${payout.partnerName} ${payout.partnerContact} ${payout.bankName} ${payout.reference}`
            .toLowerCase()
            .includes(query.toLowerCase()) &&
          (statusFilter === 'Semua Status' || payout.status === statusFilter)
      ),
    [payouts, query, statusFilter]
  );
  const changeStatus = (id: string, status: PayoutStatus) => {
    setPayouts((current) =>
      current.map((payout) =>
        payout.id === id
          ? {
              ...payout,
              status,
              processedAt: status === 'Berhasil' || status === 'Ditolak' ? new Date().toISOString() : '',
            }
          : payout
      )
    );
    setDetailTarget((current) =>
      current?.id === id
        ? {
            ...current,
            status,
            processedAt: status === 'Berhasil' || status === 'Ditolak' ? new Date().toISOString() : '',
          }
        : current
    );
  };
  return (
    <AdminPayoutsTemplate
      payouts={payouts}
      filteredPayouts={filteredPayouts}
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
