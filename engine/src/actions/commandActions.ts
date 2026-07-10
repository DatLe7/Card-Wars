import type { Turn } from '../game';
import type { Actions } from '.';

export function commandActions(action: Actions, turn: Turn): Turn {
  if (action.type === 'NEXT_TURN') {
    return {
      ...turn,
      phase: 'MAIN',
    };
  }

  return turn;
}
