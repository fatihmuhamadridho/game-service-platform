'use client';

import { apiFetch } from '@services/apiFetch.service';

import { useCallback, useEffect, useState } from 'react';
import type { ActivityCategory, ActivityLogView } from '../interfaces/admin-activity-log.interface';
import { AdminActivityLogsTemplate } from '../templates/AdminActivityLogs.template';

export const AdminActivityLogsPage = () => {
  const [logs, setLogs] = useState<ActivityLogView[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<ActivityCategory>('Semua Kategori');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    const params = new URLSearchParams({
      page: '1',
      pageSize: '100',
      ...(query ? { search: query } : {}),
      ...(category !== 'Semua Kategori' ? { category } : {}),
      ...(dateFrom ? { from: dateFrom } : {}),
      ...(dateTo ? { to: dateTo } : {}),
    });
    try {
      const response = await apiFetch(`/api/admin/activity-logs/v1/list?${params}`, { cache: 'no-store' });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.status?.message ?? 'Gagal memuat log aktivitas.');
      setLogs(payload.data.activityLogs as ActivityLogView[]);
      setTotalCount(payload.data.total);
      setError('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Gagal memuat log aktivitas.');
    }
  }, [query, category, dateFrom, dateTo]);
  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);
  return (
    <AdminActivityLogsTemplate
      logs={logs}
      totalCount={totalCount}
      query={query}
      onQueryChange={setQuery}
      category={category}
      onCategoryChange={setCategory}
      dateFrom={dateFrom}
      onDateFromChange={setDateFrom}
      dateTo={dateTo}
      onDateToChange={setDateTo}
      error={error}
    />
  );
};
