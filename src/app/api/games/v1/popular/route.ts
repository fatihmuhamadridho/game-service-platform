import { apiSuccess, apiTechnicalFailure } from '@backend/shared/api-response';
import { listPublicGames } from '@backend/game/domain/public-game.service';

import { apiFailure } from '@backend/shared/api-response';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = Number(url.searchParams.get('limit') ?? 6);
  const offset = Number(url.searchParams.get('offset') ?? 0);
  if (
    [...url.searchParams.keys()].some((key) => !['limit', 'offset'].includes(key)) ||
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 50 ||
    !Number.isInteger(offset) ||
    offset < 0
  ) {
    return apiFailure('GAMB02001', 'Parameter pagination tidak valid.', 400);
  }
  try {
    const result = await listPublicGames('', 100, 0);
    const matching = result.games.filter((game) => game.isPopular);
    const games = matching.slice(offset, offset + limit);
    return apiSuccess('GAMS00000', 'Game populer berhasil diambil.', {
      games,
      pagination: { limit, offset, total: matching.length },
    });
  } catch {
    return apiTechnicalFailure();
  }
}
