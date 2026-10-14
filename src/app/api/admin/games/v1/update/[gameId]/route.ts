import { NextResponse } from 'next/server';
import { requireAdminApi } from '@backend/shared/admin-auth';
import { toAdminGameError, updateAdminGame } from '@backend/game/domain/admin-game.service';
import { parseAdminGameInput } from '@backend/game/domain/admin-game.validation';

export async function PATCH(request: Request, context: { params: Promise<{ gameId: string }> }) {
  const denied = await requireAdminApi('GAMB01001', request);
  if (denied) return denied;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { status: { code: 'GAMB02001', message: 'Data game tidak valid.' }, data: null },
      { status: 400 }
    );
  }
  const input = parseAdminGameInput(body, true);
  if (!input)
    return NextResponse.json(
      { status: { code: 'GAMB02001', message: 'Data game tidak valid.' }, data: null },
      { status: 400 }
    );
  try {
    const { gameId } = await context.params;
    const game = await updateAdminGame(gameId, input, request);
    return NextResponse.json({ status: { code: 'GAMS00000', message: 'Game berhasil diperbarui.' }, data: { game } });
  } catch (error) {
    const failure = toAdminGameError(error);
    return NextResponse.json(
      { status: { code: failure.code, message: failure.message }, data: null },
      { status: failure.status }
    );
  }
}
