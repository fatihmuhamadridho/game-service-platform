import { apiFailure, apiSuccess, apiTechnicalFailure } from '@backend/shared/api-response';
import { listPublicServicesByGame } from '@backend/game/domain/public-game.service';

export async function GET(_request: Request, { params }: RouteContext<'/api/services/v1/games/[gameSlug]'>) {
  const { gameSlug } = await params;
  try {
    const result = await listPublicServicesByGame(gameSlug);
    if (!result) return apiFailure('SRVB02001', 'Game tidak ditemukan.', 404);
    return apiSuccess('SRVS00000', 'Layanan game berhasil diambil.', result);
  } catch {
    return apiTechnicalFailure('SRVT03001', 'Katalog layanan sedang tidak tersedia.');
  }
}
