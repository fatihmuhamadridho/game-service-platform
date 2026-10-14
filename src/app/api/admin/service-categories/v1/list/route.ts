import { NextResponse } from 'next/server';
import { requireAdminApi } from '@backend/shared/admin-auth';
import { listAdminCategories, toAdminCatalogError } from '@backend/catalog/admin-catalog.service';
export async function GET(request: Request) {
  const denied = await requireAdminApi('SCAB01001', request);
  if (denied) return denied;
  try {
    return NextResponse.json({
      status: { code: 'SCAS00000', message: 'Daftar kategori berhasil diambil.' },
      data: { categories: await listAdminCategories() },
    });
  } catch (error) {
    const e = toAdminCatalogError(error, 'SC');
    return NextResponse.json({ status: { code: e.code, message: e.message }, data: e.data }, { status: e.status });
  }
}
