import { NextResponse } from 'next/server';
import { requireAdminApi } from '@backend/shared/admin-auth';
import { updateAdminCategory, toAdminCatalogError } from '@backend/catalog/admin-catalog.service';
import { parseCategoryInput } from '@backend/catalog/admin-catalog.validation';
export async function PUT(request: Request, { params }: { params: Promise<{ categoryId: string }> }) {
  const denied = requireAdminApi('SCAB01001', request);
  if (denied) return denied;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { status: { code: 'SCAB02001', message: 'Data kategori tidak valid.' }, data: null },
      { status: 400 }
    );
  }
  const input = parseCategoryInput(body, true);
  if (!input)
    return NextResponse.json(
      { status: { code: 'SCAB02001', message: 'Data kategori tidak valid.' }, data: null },
      { status: 400 }
    );
  try {
    const { categoryId } = await params;
    return NextResponse.json({
      status: { code: 'SCAS00000', message: 'Kategori berhasil diperbarui.' },
      data: { category: await updateAdminCategory(categoryId, input, request) },
    });
  } catch (error) {
    const e = toAdminCatalogError(error, 'SC');
    return NextResponse.json({ status: { code: e.code, message: e.message }, data: e.data }, { status: e.status });
  }
}
