import { Game, type CreateGameInput } from '@cardwars/engine';

export class GameStorage {
  private readonly games = new Map<string, Game>();

  public create(input: CreateGameInput): Game {
    if (this.games.has(input.gameId)) {
      throw new Error('Game already started');
    }

    const game = new Game(input);
    this.games.set(input.gameId, game);

    return game;
  }

  public get(gameId: string): Game | undefined {
    return this.games.get(gameId);
  }

  public delete(gameId: string): boolean {
    return this.games.delete(gameId);
  }
}
