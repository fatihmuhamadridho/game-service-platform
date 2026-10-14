import { NextResponse } from 'next/server';
import { requireAdminApi } from '@backend/shared/admin-auth';
import { getAdminGame, toAdminGameError } from '@backend/game/domain/admin-game.service';

export async function GET(request: Request, context: { params: Promise<{ gameId: string }> }) {
  const denied = requireAdminApi('GAMB01001', request);
  if (denied) return denied;
  try {
    const { gameId } = await context.params;
    const game = await getAdminGame(gameId);
    return NextResponse.json({
      status: { code: 'GAMS00000', message: 'Detail game berhasil diambil.' },
      data: { game },
    });
  } catch (error) {
    const failure = toAdminGameError(error);
    return NextResponse.json(
      { status: { code: failure.code, message: failure.message }, data: null },
      { status: failure.status }
    );
  }
}
