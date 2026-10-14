import { NextResponse } from 'next/server';
import { requireAdminApi } from '@backend/shared/admin-auth';
import {
  getAdminSettings,
  parseSettingsInput,
  toAdminSettingsError,
  updateAdminSettings,
} from '@backend/settings/admin-settings.service';

export async function GET(request: Request) {
  const denied = requireAdminApi('SETB01001', request);
  if (denied) return denied;
  try {
    return NextResponse.json({
      status: { code: 'SETS00000', message: 'Pengaturan berhasil diambil.' },
      data: await getAdminSettings(),
    });
  } catch (error) {
    const failure = toAdminSettingsError(error);
    return NextResponse.json(
      { status: { code: failure.code, message: failure.message }, data: null },
      { status: failure.status }
    );
  }
}

export async function PUT(request: Request) {
  const denied = requireAdminApi('SETB01001', request);
  if (denied) return denied;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { status: { code: 'SETB02001', message: 'Pengaturan tidak valid.' }, data: null },
      { status: 400 }
    );
  }
  const input = parseSettingsInput(body);
  if (!input)
    return NextResponse.json(
      { status: { code: 'SETB02001', message: 'Periksa kembali nilai pengaturan.' }, data: null },
      { status: 400 }
    );
  try {
    return NextResponse.json({
      status: { code: 'SETS00000', message: 'Pengaturan berhasil disimpan.' },
      data: await updateAdminSettings(input, request),
    });
  } catch (error) {
    const failure = toAdminSettingsError(error);
    return NextResponse.json(
      { status: { code: failure.code, message: failure.message }, data: null },
      { status: failure.status }
    );
  }
}
