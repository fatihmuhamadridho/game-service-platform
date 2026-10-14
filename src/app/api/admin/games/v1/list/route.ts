import { NextResponse } from 'next/server';
import { requireAdminApi } from '@backend/shared/admin-auth';
import { listAdminGames, toAdminGameError } from '@backend/game/domain/admin-game.service';

export async function GET(request: Request) {
  const denied = await requireAdminApi('GAMB01001', request);
  if (denied) return denied;
  try {
    const games = await listAdminGames();
    return NextResponse.json({
      status: { code: 'GAMS00000', message: 'Daftar game berhasil diambil.' },
      data: { games },
    });
  } catch (error) {
    const failure = toAdminGameError(error);
    return NextResponse.json(
      { status: { code: failure.code, message: failure.message }, data: null },
      { status: failure.status }
    );
  }
}
