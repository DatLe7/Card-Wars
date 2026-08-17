import type { CardInstance } from '../card';
import type { GameState, Land, Player, Turn } from '../game';

export type PlayerGameView = {
  life: number;
  actionPoints: number;
  deckCardCount: number;
  hand: CardInstance[];
  graveyard: CardInstance[];
  lands: Land[];
};

export type EnemyGameView = {
  life: number;
  deckCardCount: number;
  handCardCount: number;
  graveyardCardCount: number;
  lands: Land[];
};

export type GlobalView = {
  turn: Turn;
  game: Pick<GameState, 'players'>;
};

export type PlayerView = Player & {
  turn: Turn;
  game: {
    player: PlayerGameView;
    enemy: EnemyGameView;
  };
};

export { getGlobalView, getPlayerView } from './views';
