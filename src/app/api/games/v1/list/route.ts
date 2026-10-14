import { apiFailure, apiSuccess, apiTechnicalFailure } from '@backend/shared/api-response';
import { listPublicGames } from '@backend/game/domain/public-game.service';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const allowed = new Set(['search', 'sort', 'limit', 'offset', 'category']);
  if ([...url.searchParams.keys()].some((key) => !allowed.has(key))) {
    return apiFailure('GAMB02001', 'Parameter pencarian game tidak valid.', 400);
  }
  const search = url.searchParams.get('search') ?? '';
  const limit = Number(url.searchParams.get('limit') ?? 20);
  const offset = Number(url.searchParams.get('offset') ?? 0);
  const sort = url.searchParams.get('sort') ?? 'POPULAR';
  const category = url.searchParams.get('category') ?? '';
  if (
    search.length > 100 ||
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 100 ||
    !Number.isInteger(offset) ||
    offset < 0 ||
    !['POPULAR', 'NAME_ASC'].includes(sort)
  ) {
    return apiFailure('GAMB02001', 'Parameter pencarian game tidak valid.', 400);
  }
  try {
    if (category && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(category)) {
      return apiFailure('GAMB02001', 'Parameter pencarian game tidak valid.', 400);
    }
    const result = await listPublicGames(search, limit, offset, category, sort as 'POPULAR' | 'NAME_ASC');
    return apiSuccess('GAMS00000', 'Daftar game berhasil diambil.', {
      ...result,
      pagination: { limit, offset, total: result.total },
    });
  } catch {
    return apiTechnicalFailure();
  }
}
