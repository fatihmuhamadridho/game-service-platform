'use client';

import { apiFetch } from '@services/apiFetch.service';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  MemberStatus,
  MemberStatusFilter,
  MemberTierFilter,
  MemberView,
} from '../interfaces/admin-member.interface';
import { AdminMembersTemplate } from '../templates/AdminMembers.template';

type ApiMember = {
  id: string;
  name: string;
  username: string;
  email: string;
  whatsapp?: string | null;
  tier: string;
  status: string;
  orderCount: number;
  totalSpend: number;
  joinedAt: string;
};

const formatRupiah = (amount: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
const displayDate = (value: string) =>
  new Date(value).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
const mapMember = (user: ApiMember): MemberView => ({
  id: user.id,
  name: user.name,
  username: user.username,
  email: user.email,
  whatsapp: user.whatsapp ?? '—',
  tier: (user.tier[0] + user.tier.slice(1).toLowerCase()) as MemberView['tier'],
  status: user.status === 'ACTIVE' ? 'Aktif' : 'Diblokir',
  orderCount: user.orderCount,
  totalSpend: user.totalSpend,
  joinedAt: displayDate(user.joinedAt),
});

export const AdminMembersPage = () => {
  const [members, setMembers] = useState<MemberView[]>([]);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<MemberStatusFilter>('Semua Status');
  const [tierFilter, setTierFilter] = useState<MemberTierFilter>('Semua Tier');
  const [detailTarget, setDetailTarget] = useState<MemberView | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const loadMembers = useCallback(async () => {
    setLoading(true);
    const status = statusFilter === 'Semua Status' ? '' : statusFilter === 'Aktif' ? 'ACTIVE' : 'BLOCKED';
    const params = new URLSearchParams({
      page: '1',
      pageSize: '100',
      ...(query.trim() ? { search: query.trim() } : {}),
      ...(status ? { status } : {}),
    });
    try {
      const response = await apiFetch(`/api/admin/users/v1/list?${params}`, { cache: 'no-store' });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.status?.message ?? 'Gagal memuat member.');
      setMembers((payload.data.users as ApiMember[]).map(mapMember));
      setError('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Gagal memuat member.');
    } finally {
      setLoading(false);
    }
  }, [query, statusFilter]);
  useEffect(() => {
    void Promise.resolve().then(loadMembers);
  }, [loadMembers]);

  const filteredMembers = useMemo(
    () => members.filter((member) => tierFilter === 'Semua Tier' || member.tier === tierFilter),
    [members, tierFilter]
  );
  const viewMember = async (member: MemberView) => {
    setError('');
    try {
      const response = await apiFetch(`/api/admin/users/v1/detail/${member.id}`, { cache: 'no-store' });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.status?.message ?? 'Gagal memuat detail member.');
      setDetailTarget(mapMember(payload.data.user as ApiMember));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Gagal memuat detail member.');
    }
  };
  const changeStatus = async (id: string, status: MemberStatus) => {
    const selectedMember = detailTarget;
    if (!selectedMember || selectedMember.id !== id) return;
    setError('');
    try {
      const response = await apiFetch(`/api/admin/users/v1/update/${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status: status === 'Aktif' ? 'ACTIVE' : 'BLOCKED' }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.status?.message ?? 'Gagal memperbarui status member.');
      await loadMembers();
      await viewMember(selectedMember);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Gagal memperbarui status member.');
    }
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
      onView={viewMember}
      onCloseDetail={() => setDetailTarget(null)}
      onStatusChange={changeStatus}
      formatRupiah={formatRupiah}
      loading={loading}
      error={error}
    />
  );
};
