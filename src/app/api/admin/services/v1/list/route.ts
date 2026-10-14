import { NextResponse } from 'next/server';
import { requireAdminApi } from '@backend/shared/admin-auth';
import { listAdminServices, toAdminCatalogError } from '@backend/catalog/admin-catalog.service';
export async function GET(request: Request) {
  const denied = await requireAdminApi('SRVB01001', request);
  if (denied) return denied;
  try {
    return NextResponse.json({
      status: { code: 'SRVS00000', message: 'Daftar layanan berhasil diambil.' },
      data: await listAdminServices(),
    });
  } catch (error) {
    const e = toAdminCatalogError(error, 'SRV');
    return NextResponse.json({ status: { code: e.code, message: e.message }, data: e.data }, { status: e.status });
  }
}
