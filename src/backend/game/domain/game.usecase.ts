import { Game } from './game.model';
import type { GameRepository } from './game.repository';
import type { GameResult } from './game.interface';

export class GetListGameUseCase {
  constructor(private readonly gameRepository: GameRepository) {}

  async execute(): Promise<GameResult.getListGame> {
    const games = await this.gameRepository.getListGame();

    return {
      status: {
        code: 'SUCCESS',
        message: 'SUCCESS HIT API',
      },
      data: games.map((game) => new Game(game)),
    };
  }
}
