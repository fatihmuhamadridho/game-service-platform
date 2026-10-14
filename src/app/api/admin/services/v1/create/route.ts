import { NextResponse } from 'next/server';
import { requireAdminApi } from '@backend/shared/admin-auth';
import { createAdminService, toAdminCatalogError } from '@backend/catalog/admin-catalog.service';
import { parseCreateServiceInput } from '@backend/catalog/admin-catalog.validation';
export async function POST(request: Request) {
  const denied = requireAdminApi('SRVB01001', request);
  if (denied) return denied;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { status: { code: 'SRVB02001', message: 'Data layanan tidak valid.' }, data: null },
      { status: 400 }
    );
  }
  const input = parseCreateServiceInput(body);
  if (!input)
    return NextResponse.json(
      { status: { code: 'SRVB02001', message: 'Data layanan tidak valid.' }, data: null },
      { status: 400 }
    );
  try {
    const service = await createAdminService(input, request);
    return NextResponse.json(
      { status: { code: 'SRVS00000', message: 'Layanan berhasil dibuat.' }, data: { service } },
      { status: 201 }
    );
  } catch (error) {
    const e = toAdminCatalogError(error, 'SRV');
    return NextResponse.json({ status: { code: e.code, message: e.message }, data: e.data }, { status: e.status });
  }
}
