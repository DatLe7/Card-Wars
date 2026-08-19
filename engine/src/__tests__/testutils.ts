import finnDecklist from '../data/finn.json';
import jakeDecklist from '../data/jake.json';
import type { CardInstance } from '../card';
import type { CardType, Deck } from '../game';
import { Game } from '../game/game.js';

type CreateTestGameOptions = {
  gameId?: string;
  playerOneName?: string;
  playerTwoName?: string;
  shuffleDeck?: boolean;
};

export function createTestGame({
  gameId = 'game_123',
  playerOneName = 'Player 1',
  playerTwoName = 'Player 2',
  shuffleDeck,
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
    shuffleDeck,
  });
}

export function createTestGameWithCardInHand(
  cardType: CardType,
): { game: Game; card: CardInstance } {
  let game = createTestGame();
  let card = game
    .getPlayerView('p1')
    .game.player.hand.find((handCard) => handCard.type === cardType);

  while (card === undefined) {
    game = createTestGame();
    card = game
      .getPlayerView('p1')
      .game.player.hand.find((handCard) => handCard.type === cardType);
  }

  return { game, card };
}

export function playCard(
  game: Game,
  playerId: string,
  cardInstanceId: string,
  landIndex?: number,
): void {
  const playCardAction = game
    .getAvailableActions(playerId)
    .find(
      (action) =>
        action.type === 'PLAY_CARD' &&
        action.cardInstanceId === cardInstanceId &&
        (landIndex === undefined || action.laneIndex === landIndex),
    );

  /* v8 ignore if -- @preserve */
  if (playCardAction === undefined) {
    throw new Error(`No play action for card ${cardInstanceId}.`);
  }

  game.command(playCardAction);
}
