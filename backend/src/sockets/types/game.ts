import type { Actions } from '@cardwars/engine';

export interface GameActionRequest {
  gameId: string;
  action: Actions;
}
