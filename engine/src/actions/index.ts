export type NextTurnAction = {
  type: 'NEXT_TURN';
  playerId: string;
};

export type DrawCardAction = {
  type: 'DRAW_CARD';
  playerId: string;
};

export type PlayCardAction = {
  type: 'PLAY_CARD';
  playerId: string;
  cardInstanceId: string;
  laneIndex: number;
};

export type Actions = NextTurnAction | DrawCardAction | PlayCardAction;
