import type { GameState, Turn } from '../game';
import type { Actions } from '.';

export function commandActions(
  action: Actions,
  game: GameState,
  turn: Turn,
): void {
  if (action.type === 'NEXT_TURN') {
    const playerGame = game.players[action.playerId];

    if (playerGame === undefined) {
      return;
    }

    const drawnCard = playerGame.deck.shift();

    playerGame.actionPoints = 2;

    if (drawnCard !== undefined) {
      playerGame.hand.push(drawnCard);
    }

    turn.phase = 'MAIN';
  }
}
