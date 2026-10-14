import { NextResponse } from 'next/server';
import { requireAdminApi } from '@backend/shared/admin-auth';
import { getAdminService, toAdminCatalogError } from '@backend/catalog/admin-catalog.service';
export async function GET(request: Request, { params }: { params: Promise<{ serviceId: string }> }) {
  const denied = await requireAdminApi('SRVB01001', request);
  if (denied) return denied;
  try {
    const { serviceId } = await params;
    return NextResponse.json({
      status: { code: 'SRVS00000', message: 'Layanan berhasil diambil.' },
      data: { service: await getAdminService(serviceId) },
    });
  } catch (error) {
    const e = toAdminCatalogError(error, 'SRV');
    return NextResponse.json({ status: { code: e.code, message: e.message }, data: e.data }, { status: e.status });
  }
}
