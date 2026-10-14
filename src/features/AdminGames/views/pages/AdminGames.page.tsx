import { listAdminGames } from '@backend/game/domain/admin-game.service';
import type { AdminGameView } from '../interfaces/admin-game.interface';
import { AdminGamesClientPage } from './AdminGames.client.page';

export const dynamic = 'force-dynamic';

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'Asia/Jakarta',
});

const toAdminGameView = (game: Awaited<ReturnType<typeof listAdminGames>>[number]): AdminGameView => ({
  ...game,
  updatedAt: dateFormatter.format(new Date(game.updatedAt)),
});

export const AdminGamesPage = async () => {
  let initialGames: AdminGameView[] = [];
  let loadError: string | undefined;
  try {
    const games = await listAdminGames();
    initialGames = games.map(toAdminGameView);
  } catch {
    loadError = 'Data game gagal dimuat. Muat ulang halaman untuk mencoba lagi.';
  }
  return <AdminGamesClientPage initialGames={initialGames} loadError={loadError} />;
};
