import { db } from '@prisma/db';

export class AdminActivityError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status: number
  ) {
    super(message);
  }
}

const categoryLabel = (value: string) =>
  ({ ORDER: 'Pesanan', CATALOG: 'Produk', USER: 'Pengguna', CONTENT: 'Konten', SETTINGS: 'Pengaturan' })[value] ??
  'Pengaturan';

export async function listAdminActivity(params: {
  search: string;
  category: string;
  from: string;
  to: string;
  page: number;
  pageSize: number;
}) {
  const rows = await db.orm.activity_log.all();
  const search = params.search.toLocaleLowerCase('id-ID');
  const from = params.from ? new Date(`${params.from}T00:00:00.000Z`) : null;
  const to = params.to ? new Date(`${params.to}T23:59:59.999Z`) : null;
  const filtered = rows
    .map((row) => ({
      id: String(row._id),
      adminName: row.actor_name_snapshot ?? 'System',
      adminEmail: row.actor_email_snapshot ?? '',
      action: row.action_label,
      target: row.target_reference ?? row.target_type,
      category: categoryLabel(row.category),
      occurredAt: row.occurred_at.toISOString(),
      ipAddress: row.source_ip ?? '—',
      result: row.result === 'SUCCESS' ? 'Berhasil' : 'Gagal',
    }))
    .filter(
      (row) =>
        (!params.category || row.category === params.category) &&
        (!from || new Date(row.occurredAt) >= from) &&
        (!to || new Date(row.occurredAt) <= to) &&
        (!search ||
          `${row.adminName} ${row.adminEmail} ${row.action} ${row.target} ${row.ipAddress}`
            .toLocaleLowerCase('id-ID')
            .includes(search))
    )
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  const start = (params.page - 1) * params.pageSize;
  return {
    activityLogs: filtered.slice(start, start + params.pageSize),
    total: filtered.length,
    summary: {
      succeeded: filtered.filter((row) => row.result === 'Berhasil').length,
      failed: filtered.filter((row) => row.result === 'Gagal').length,
    },
    pagination: {
      page: params.page,
      pageSize: params.pageSize,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / params.pageSize),
    },
  };
}

export function toAdminActivityError(error: unknown) {
  if (error instanceof AdminActivityError) return error;
  return new AdminActivityError('ACTT03001', 'Log aktivitas sementara tidak tersedia.', 500);
}
