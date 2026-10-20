import { NextResponse } from 'next/server';
import { getPublicSiteSettings, toAdminSettingsError } from '@backend/settings/admin-settings.service';

export async function GET() {
  try {
    return NextResponse.json(
      {
        status: { code: 'SETS00000', message: 'Pengaturan situs berhasil diambil.' },
        data: await getPublicSiteSettings(),
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    const failure = toAdminSettingsError(error);
    return NextResponse.json(
      { status: { code: failure.code, message: failure.message }, data: null },
      { status: failure.status, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
