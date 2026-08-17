import type { CardInstance } from '../card';

export type LandscapeType = 'Blue Plains' | 'Cornfield';

export type CardLand = 'Blue Plains' | 'Cornfield' | 'Rainbow';

export type CardType = 'building' | 'creature' | 'spell';

export type Land = {
  landscape: LandscapeType;
  creature: CardInstance | undefined;
  building: CardInstance | undefined;
};

export type CardDefinition = {
  id: string;
  name: string;
  cardType: CardType;
  land: CardLand;
  cost: number;
  attack?: number;
  defense?: number;
};

export type DecklistEntry = {
  cardId: string;
  count: number;
};

export type Deck = {
  landscape: LandscapeType[];
  deck: DecklistEntry[];
};

export type Player = {
  id: string;
  name: string;
  decklist: Deck;
};

export type TurnPhase = 'READY' | 'MAIN' | 'BATTLE';

export type Turn = {
  number: number;
  activePlayerId: string;
  phase: TurnPhase;
};

export type PlayerGameState = {
  life: number;
  actionPoints: number;
  deck: CardInstance[];
  hand: CardInstance[];
  graveyard: CardInstance[];
  lands: Land[];
};

export type GameState = {
  players: Record<string, PlayerGameState>;
  turn: Turn;
};

export type CreateGameInput = {
  gameId: string;
  players: Player[];
  firstPlayer: string;
};
