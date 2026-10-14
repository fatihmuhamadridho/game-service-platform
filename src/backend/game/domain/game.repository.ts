import type { GameResponse } from './game.interface';

export abstract class GameRepository {
  abstract getListGame(): Promise<GameResponse.getListGame>;
}
