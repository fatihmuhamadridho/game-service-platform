import { NextResponse } from 'next/server';
import { requireAdminApi } from '@backend/shared/admin-auth';
import { listAdminActivity, toAdminActivityError } from '@backend/activity/admin-activity.service';

export async function GET(request: Request) {
  const denied = await requireAdminApi('ACTB01001', request);
  if (denied) return denied;
  const query = new URL(request.url).searchParams;
  const page = Number(query.get('page') ?? '1');
  const pageSize = Number(query.get('pageSize') ?? '50');
  const search = query.get('search') ?? '';
  const category = query.get('category') ?? '';
  const from = query.get('from') ?? '';
  const to = query.get('to') ?? '';
  const keys = ['page', 'pageSize', 'search', 'category', 'from', 'to'];
  if (
    [...query.keys()].some((key) => !keys.includes(key)) ||
    !Number.isInteger(page) ||
    page < 1 ||
    !Number.isInteger(pageSize) ||
    pageSize < 1 ||
    pageSize > 100 ||
    search.length > 100 ||
    category.length > 32 ||
    (from && !/^\d{4}-\d{2}-\d{2}$/.test(from)) ||
    (to && !/^\d{4}-\d{2}-\d{2}$/.test(to)) ||
    (from && to && from > to)
  ) {
    return NextResponse.json(
      { status: { code: 'ACTB02001', message: 'Filter aktivitas tidak valid.' }, data: null },
      { status: 400 }
    );
  }
  try {
    const data = await listAdminActivity({ search, category, from, to, page, pageSize });
    return NextResponse.json({ status: { code: 'ACTS00000', message: 'Log aktivitas berhasil diambil.' }, data });
  } catch (error) {
    const failure = toAdminActivityError(error);
    return NextResponse.json(
      { status: { code: failure.code, message: failure.message }, data: null },
      { status: failure.status }
    );
  }
}
