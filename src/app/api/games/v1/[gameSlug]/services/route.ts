import { listPublicServicesByGame } from '@backend/game/domain/public-game.service';
import { apiFailure, apiSuccess } from '@backend/shared/api-response';

export async function GET(request: Request, context: { params: Promise<{ gameSlug: string }> }) {
  if ([...new URL(request.url).searchParams.keys()].length > 0) {
    return apiFailure('SVB02001', 'Parameter layanan tidak didukung.', 400);
  }
  const { gameSlug } = await context.params;
  const slug = gameSlug.trim().toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return apiFailure('SVB02001', 'Slug game tidak valid.', 400);
  }
  try {
    const result = await listPublicServicesByGame(slug);
    if (!result) return apiFailure('SVB02002', 'Game tidak tersedia.', 404);
    return apiSuccess('SVS00000', 'Daftar layanan game berhasil diambil.', result);
  } catch {
    return apiFailure('SVT03001', 'Katalog layanan sedang tidak tersedia.', 500);
  }
}
