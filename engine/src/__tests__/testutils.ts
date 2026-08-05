import finnDecklist from '../data/finn.json';
import jakeDecklist from '../data/jake.json';
import type { CardType, Deck } from '../game';
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

export function createTestGameWithCardInHand(cardType: CardType) {
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

export function createMainPhaseTestGameWithCardInHand(cardType: CardType) {
  const { game, card } = createTestGameWithCardInHand(cardType);

  game.command({
    type: 'NEXT_TURN',
    playerId: 'p1',
  });

  const playCardAction = game
    .getAvailableActions('p1')
    .find(
      (action) =>
        action.type === 'PLAY_CARD' &&
        action.cardInstanceId === card.instanceId,
    );

  return { game, card, playCardAction };
}
