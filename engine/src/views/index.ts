import type { CardInstance } from '../card';
import type { GameState, Player, Turn } from '../game';

export type PlayerGameView = {
  actionPoints: number;
  deckCardCount: number;
  hand: CardInstance[];
  graveyard: CardInstance[];
};

export type EnemyGameView = {
  deckCardCount: number;
  handCardCount: number;
  graveyardCardCount: number;
};

export type GlobalView = {
  turn: Turn;
  game: GameState;
};

export type PlayerView = Player & {
  turn: Turn;
  game: {
    player: PlayerGameView;
    enemy: EnemyGameView;
  };
};

export { getGlobalView, getPlayerView } from './views';
