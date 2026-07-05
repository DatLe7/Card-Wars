import type { Turn } from '../game';
import type { Actions } from '.';

export function getAvailableActions(playerId: string, turn: Turn): Actions[] {
  if (playerId !== turn.activePlayerId) {
    return [];
  }

  return [{ type: 'NEXT_TURN', playerId }];
}
