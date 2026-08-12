import type { Player, PlayerGameState, Turn } from '../game';
import type { Actions } from '.';

const laneIndexes = [0, 1, 2, 3] as const;

export function getAvailableActions(
  playerId: string,
  turn: Turn,
  player?: Player,
  playerGame?: PlayerGameState,
): Actions[] {
  if (playerId !== turn.activePlayerId) return [];

  if (turn.phase === 'READY') {
    return [{ type: 'NEXT_TURN', playerId }];
  }

  /* v8 ignore if -- @preserve */
  if (player === undefined || playerGame === undefined) return [];

  const playCardActions = playerGame.hand.flatMap((card) => {
    const hasEnoughActions = card.cost <= playerGame.actionPoints;
    const matchingLandscapeCount = player.decklist.landscape.filter(
      (landscape) => landscape === card.land,
    ).length;
    const hasEnoughLandscapes =
      card.land === 'Rainbow' || matchingLandscapeCount >= card.cost;

    /* v8 ignore if -- @preserve */
    if (!hasEnoughActions || !hasEnoughLandscapes) return [];

    if (card.type === 'spell') {
      return [
        {
          type: 'PLAY_CARD' as const,
          playerId,
          cardInstanceId: card.instanceId,
        } as Actions,
      ];
    }

    return laneIndexes.map((laneIndex) => ({
      type: 'PLAY_CARD' as const,
      playerId,
      cardInstanceId: card.instanceId,
      laneIndex,
    }));
  });

  const drawCardActions: Actions[] =
    playerGame.actionPoints > 0
      ? [
        {
          type: 'DRAW_CARD',
          playerId,
        },
      ]
      : [];

  return [...drawCardActions, ...playCardActions];
}
