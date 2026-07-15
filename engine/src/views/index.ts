import type { CardInstance } from '../card';
import type { GameState, Player, Turn } from '../game';

export type PlayerGameView = {
  actionPoints: number;
  deckCardCount: number;
  hand: CardInstance[];
  graveyard: CardInstance[];
};

export type GlobalView = {
  turn: Turn;
  game: GameState;
};

export type PlayerView = Player & {
  turn: Turn;
  game: PlayerGameView;
};

export { getGlobalView, getPlayerView } from './views';
