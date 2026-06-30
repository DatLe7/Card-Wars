export type LandscapeType = 'blue_plains' | 'cornfield';

export type CardLand = 'Blue Plains' | 'Cornfield' | 'Rainbow';

export type CardType = 'building' | 'creature' | 'spell';

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
  landscape: LandscapeType;
  deck: DecklistEntry[];
};

export type Player = {
  id: string;
  name: string;
  decklist: Deck;
};

export type TurnPhase = 'READY';

export type Turn = {
  number: number;
  activePlayerId: string;
  phase: TurnPhase;
};

export type PlayerView = Player & {
  turn: Turn;
};

export type CreateGameInput = {
  gameId: string;
  players: Player[];
  firstPlayer: string;
};
