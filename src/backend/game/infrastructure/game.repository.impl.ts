import { db } from '../../../prisma/db';
import type { GameDataProps, GameResponse } from '../domain/game.interface';
import type { GameRepository } from '../domain/game.repository';

export class GameRepositoryImpl implements GameRepository {
  async getListGame(): Promise<GameResponse.getListGame> {
    const games = await db.orm.game_catalog.include('services').orderBy({ sort_order: 1 }).all();

    return games
      .filter((game) => !game.deleted_at)
      .map((game): GameDataProps => ({
        id: game._id,
        name: game.name,
        slug: game.slug,
        serviceSummary: game.service_summary,
        artworkKey: game.artwork_key,
        serviceCount: game.services.filter((service) => service.is_active && !service.deleted_at).length,
        active: game.is_active,
        popular: game.is_popular,
        sortOrder: game.sort_order,
        updatedAt: game.updated_at.toISOString(),
      }));
  }
}
