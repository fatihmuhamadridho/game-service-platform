import { NextResponse } from 'next/server';
import { requireAdminApi } from '@backend/shared/admin-auth';
import { updateAdminService, toAdminCatalogError } from '@backend/catalog/admin-catalog.service';
import { parseServiceInput } from '@backend/catalog/admin-catalog.validation';
export async function PUT(request: Request, { params }: { params: Promise<{ serviceId: string }> }) {
  const denied = await requireAdminApi('SRVB01001', request);
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
  const input = parseServiceInput(body, true);
  if (!input)
    return NextResponse.json(
      { status: { code: 'SRVB02001', message: 'Data layanan tidak valid.' }, data: null },
      { status: 400 }
    );
  try {
    const { serviceId } = await params;
    return NextResponse.json({
      status: { code: 'SRVS00000', message: 'Layanan berhasil diperbarui.' },
      data: { service: await updateAdminService(serviceId, input, request) },
    });
  } catch (error) {
    const e = toAdminCatalogError(error, 'SRV');
    return NextResponse.json({ status: { code: e.code, message: e.message }, data: e.data }, { status: e.status });
  }
}
