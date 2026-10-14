import { GameRepositoryImpl } from '../infrastructure/game.repository.impl';
import { GetListGameUseCase } from './game.usecase';

export class GameController {
  private readonly gameRepositoryImpl: GameRepositoryImpl;
  private readonly getListGameUseCase: GetListGameUseCase;

  constructor() {
    this.gameRepositoryImpl = new GameRepositoryImpl();
    this.getListGameUseCase = new GetListGameUseCase(this.gameRepositoryImpl);
  }

  getListGame() {
    return this.getListGameUseCase.execute();
  }
}
