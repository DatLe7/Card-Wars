import finnDecklist from '../data/finn.json';
import jakeDecklist from '../data/jake.json';
import type { Deck } from '../game';
import { Game } from '../game/game.js';

type CreateTestGameOptions = {
  gameId?: string;
  playerOneName?: string;
  playerTwoName?: string;
};

export function createTestGame({
  gameId = 'game_123',
  playerOneName = 'Player 1',
  playerTwoName = 'Player 2',
}: CreateTestGameOptions = {}): Game {
  return new Game({
    gameId,
    players: [
      {
        id: 'p1',
        name: playerOneName,
        decklist: jakeDecklist as Deck,
      },
      {
        id: 'p2',
        name: playerTwoName,
        decklist: finnDecklist as Deck,
      },
    ],
    firstPlayer: 'p1',
  });
}
