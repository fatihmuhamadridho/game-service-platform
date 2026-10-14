import { NextResponse } from 'next/server';
import { requireAdminApi } from '@backend/shared/admin-auth';
import { getAdminCategory, toAdminCatalogError } from '@backend/catalog/admin-catalog.service';
export async function GET(request: Request, { params }: { params: Promise<{ categoryId: string }> }) {
  const denied = requireAdminApi('SCAB01001', request);
  if (denied) return denied;
  try {
    const { categoryId } = await params;
    return NextResponse.json({
      status: { code: 'SCAS00000', message: 'Kategori berhasil diambil.' },
      data: { category: await getAdminCategory(categoryId) },
    });
  } catch (error) {
    const e = toAdminCatalogError(error, 'SC');
    return NextResponse.json({ status: { code: e.code, message: e.message }, data: e.data }, { status: e.status });
  }
}
