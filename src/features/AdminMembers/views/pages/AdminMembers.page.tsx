'use client';

import { useMemo, useState } from 'react';
import type {
  MemberStatus,
  MemberStatusFilter,
  MemberTierFilter,
  MemberView,
} from '../interfaces/admin-member.interface';
import { AdminMembersTemplate } from '../templates/AdminMembers.template';

const seedMembers: MemberView[] = [
  {
    id: 'member-1',
    name: 'Budi Santoso',
    username: 'budi123',
    email: 'budi.santoso@example.com',
    whatsapp: '+6281234567890',
    tier: 'Gold',
    status: 'Aktif',
    orderCount: 28,
    totalSpend: 2450000,
    joinedAt: '7 Okt 2026',
  },
  {
    id: 'member-2',
    name: 'Santi Putri',
    username: 'santoso98',
    email: 'santi.putri@example.com',
    whatsapp: '+6282234567890',
    tier: 'Silver',
    status: 'Aktif',
    orderCount: 12,
    totalSpend: 780000,
    joinedAt: '6 Okt 2026',
  },
  {
    id: 'member-3',
    name: 'Indah Putri',
    username: 'indahputri',
    email: 'indah.putri@example.com',
    whatsapp: '+6281334567890',
    tier: 'Platinum',
    status: 'Aktif',
    orderCount: 54,
    totalSpend: 6840000,
    joinedAt: '5 Okt 2026',
  },
  {
    id: 'member-4',
    name: 'Raka Pratama',
    username: 'rakaaa',
    email: 'raka.pratama@example.com',
    whatsapp: '+6285234567890',
    tier: 'Bronze',
    status: 'Diblokir',
    orderCount: 3,
    totalSpend: 155000,
    joinedAt: '4 Okt 2026',
  },
  {
    id: 'member-5',
    name: 'Dimas Saputra',
    username: 'dimasaja',
    email: 'dimas.saputra@example.com',
    whatsapp: '+6287734567890',
    tier: 'Bronze',
    status: 'Aktif',
    orderCount: 4,
    totalSpend: 220000,
    joinedAt: '2 Okt 2026',
  },
];
const formatRupiah = (amount: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);

export const AdminMembersPage = () => {
  const [members, setMembers] = useState(seedMembers);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<MemberStatusFilter>('Semua Status');
  const [tierFilter, setTierFilter] = useState<MemberTierFilter>('Semua Tier');
  const [detailTarget, setDetailTarget] = useState<MemberView | null>(null);
  const filteredMembers = useMemo(
    () =>
      members.filter(
        (member) =>
          `${member.name} ${member.username} ${member.email} ${member.whatsapp}`
            .toLowerCase()
            .includes(query.toLowerCase()) &&
          (statusFilter === 'Semua Status' || member.status === statusFilter) &&
          (tierFilter === 'Semua Tier' || member.tier === tierFilter)
      ),
    [members, query, statusFilter, tierFilter]
  );
  const changeStatus = (id: string, status: MemberStatus) => {
    setMembers((current) => current.map((member) => (member.id === id ? { ...member, status } : member)));
    setDetailTarget((current) => (current?.id === id ? { ...current, status } : current));
  };
  return (
    <AdminMembersTemplate
      members={members}
      filteredMembers={filteredMembers}
      query={query}
      onQueryChange={setQuery}
      statusFilter={statusFilter}
      onStatusFilterChange={setStatusFilter}
      tierFilter={tierFilter}
      onTierFilterChange={setTierFilter}
      detailTarget={detailTarget}
      onView={setDetailTarget}
      onCloseDetail={() => setDetailTarget(null)}
      onStatusChange={changeStatus}
      formatRupiah={formatRupiah}
    />
  );
};
