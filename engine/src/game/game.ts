import type { CreateGameInput, Player, PlayerView, Turn } from '.';

export class Game {
  private readonly players: Player[];
  private readonly turn: Turn;

  constructor(input: CreateGameInput) {
    this.players = input.players.map((player) => ({ ...player }));
    this.turn = {
      number: 1,
      activePlayerId: input.firstPlayer,
      phase: 'READY',
    };
  }

  getPlayerView(playerId: string): PlayerView {
    const player = this.players.find((candidate) => candidate.id === playerId);

    if (player === undefined) {
      throw new Error(`Player ${playerId} was not found in this game.`);
    }

    return {
      ...player,
      turn: { ...this.turn },
    };
  }

  getTurn(): Turn {
    return { ...this.turn };
  }
}
