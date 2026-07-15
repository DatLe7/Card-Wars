export type NextTurnAction = {
  type: 'NEXT_TURN';
  playerId: string;
};

export type PlayCardAction = {
  type: 'PLAY_CARD';
  playerId: string;
  cardInstanceId: string;
  laneIndex: number;
};

export type Actions = NextTurnAction | PlayCardAction;
