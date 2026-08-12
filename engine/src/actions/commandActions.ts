import type { GameState, Turn } from '../game';
import type { Actions } from '.';

export function commandActions(
  action: Actions,
  game: GameState,
  turn: Turn,
): void {
  switch (action.type) {
  case 'NEXT_TURN': {
    const playerGameState = game.players[action.playerId];

    /* v8 ignore if -- @preserve */
    if (playerGameState === undefined) return;

    const drawnCard = playerGameState.deck.shift();

    playerGameState.actionPoints = 2;

    /* v8 ignore if -- @preserve */
    if (drawnCard !== undefined) {
      playerGameState.hand.push(drawnCard);
    }

    turn.phase = 'MAIN';
    break;
  }
  case 'DRAW_CARD': {
    const playerGameState = game.players[action.playerId];

    /* v8 ignore if -- @preserve */
    if (playerGameState === undefined) return;

    const drawnCard = playerGameState.deck.shift();

    /* v8 ignore if -- @preserve */
    if (drawnCard !== undefined) {
      playerGameState.hand.push(drawnCard);
    }

    playerGameState.actionPoints -= 1;

    break;
  }
  case 'PLAY_CARD': {
    const playerGameState = game.players[action.playerId];

    /* v8 ignore if -- @preserve */
    if (playerGameState === undefined) return;

    const cardIndex = playerGameState.hand.findIndex(
      (card) => card.instanceId === action.cardInstanceId,
    );

    /* v8 ignore if -- @preserve */
    if (cardIndex === -1) return;

    const cardToPlay = playerGameState.hand[cardIndex];
    const targetLand = playerGameState.lands[action.laneIndex];

    /* v8 ignore if -- @preserve */
    if (
      (cardToPlay?.type === 'creature' || cardToPlay?.type === 'building') &&
      targetLand === undefined
    ) return;

    const [playedCard] = playerGameState.hand.splice(cardIndex, 1);

    /* v8 ignore if -- @preserve */
    if (playedCard === undefined) return;

    playerGameState.actionPoints -= playedCard.cost;

    if (playedCard.type === 'spell') {
      playerGameState.graveyard.push(playedCard);
    }

    if (playedCard.type === 'creature' && targetLand !== undefined) {
      targetLand.creature = playedCard;
    }

    if (playedCard.type === 'building' && targetLand !== undefined) {
      targetLand.building = playedCard;
    }

    break;
  }
  }
}
