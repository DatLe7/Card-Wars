import type { Player, PlayerGameState, Turn } from '../game';
import type { Actions } from '.';

const laneIndexes = [0, 1, 2, 3] as const;

export function getAvailableActions(
  playerId: string,
  turn: Turn,
  player?: Player,
  playerGame?: PlayerGameState,
): Actions[] {
  if (playerId !== turn.activePlayerId) {
    return [];
  }

  if (turn.phase === 'READY') {
    return [{ type: 'NEXT_TURN', playerId }];
  }

  if (player === undefined || playerGame === undefined) {
    return [];
  }

  return playerGame.hand.flatMap((card) => {
    const hasEnoughActions = card.cost <= playerGame.actionPoints;
    const matchingLandscapeCount = player.decklist.landscape.filter(
      (landscape) => landscape === card.land,
    ).length;
    const hasEnoughLandscapes =
      card.land === 'Rainbow' || matchingLandscapeCount >= card.cost;

    if (!hasEnoughActions || !hasEnoughLandscapes) {
      return [];
    }

    return laneIndexes.map((laneIndex) => ({
      type: 'PLAY_CARD' as const,
      playerId,
      cardInstanceId: card.instanceId,
      laneIndex,
    }));
  });
}
