import { NextResponse } from 'next/server';
import { requireAdminApi } from '@backend/shared/admin-auth';
import { getAdminDashboardOverview, toAdminDashboardError } from '@backend/dashboard/admin-dashboard.service';

export async function GET(request: Request) {
  const denied = requireAdminApi('DASHB01001', request);
  if (denied) return denied;
  const query = new URL(request.url).searchParams;
  const fromValue = query.get('from');
  const toValue = query.get('to');
  const granularity = query.get('granularity') ?? 'daily';
  const keys = ['from', 'to', 'granularity'];
  const validDate = (value: string | null) =>
    !value || (/^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`)));
  if (
    [...query.keys()].some((key) => !keys.includes(key)) ||
    !validDate(fromValue) ||
    !validDate(toValue) ||
    !['daily', 'weekly', 'monthly'].includes(granularity) ||
    (fromValue &&
      toValue &&
      (fromValue > toValue ||
        Date.parse(`${toValue}T00:00:00Z`) - Date.parse(`${fromValue}T00:00:00Z`) > 366 * 86400000))
  )
    return NextResponse.json(
      { status: { code: 'DASHB02001', message: 'Rentang dashboard tidak valid.' }, data: null },
      { status: 400 }
    );
  const today = new Date();
  const end = toValue
    ? new Date(`${toValue}T23:59:59.999Z`)
    : new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 23, 59, 59, 999));
  const start = fromValue ? new Date(`${fromValue}T00:00:00.000Z`) : new Date(end.getTime() - 6 * 86400000);
  try {
    const overview = await getAdminDashboardOverview(start, end, granularity as 'daily' | 'weekly' | 'monthly');
    return NextResponse.json({
      status: { code: 'DASH00000', message: 'Ringkasan dashboard berhasil diambil.' },
      data: { overview },
    });
  } catch (error) {
    const failure = toAdminDashboardError(error);
    return NextResponse.json(
      { status: { code: failure.code, message: failure.message }, data: null },
      { status: failure.status }
    );
  }
}
