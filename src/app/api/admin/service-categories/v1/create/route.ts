import { NextResponse } from 'next/server';
import { requireAdminApi } from '@backend/shared/admin-auth';
import { createAdminCategory, toAdminCatalogError } from '@backend/catalog/admin-catalog.service';
import { parseCreateCategoryInput } from '@backend/catalog/admin-catalog.validation';
export async function POST(request: Request) {
  const denied = await requireAdminApi('SCAB01001', request);
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
  const input = parseCreateCategoryInput(body);
  if (!input)
    return NextResponse.json(
      { status: { code: 'SCAB02001', message: 'Data kategori tidak valid.' }, data: null },
      { status: 400 }
    );
  try {
    const category = await createAdminCategory(input, request);
    return NextResponse.json(
      { status: { code: 'SCAS00000', message: 'Kategori berhasil dibuat.' }, data: { category } },
      { status: 201 }
    );
  } catch (error) {
    const e = toAdminCatalogError(error, 'SC');
    return NextResponse.json({ status: { code: e.code, message: e.message }, data: e.data }, { status: e.status });
  }
}
