import { listPublicServiceCategories } from '@backend/game/domain/public-game.service';
import { apiFailure, apiSuccess } from '@backend/shared/api-response';

export async function GET(request: Request) {
  if ([...new URL(request.url).searchParams.keys()].length > 0) {
    return apiFailure('SCAB02001', 'Parameter kategori tidak didukung.', 400);
  }
  try {
    const result = await listPublicServiceCategories();
    return apiSuccess('SCAS00000', 'Daftar kategori layanan berhasil diambil.', { categories: result.categories });
  } catch {
    return apiFailure('SCAT03001', 'Katalog layanan sedang tidak tersedia.', 500);
  }
}
