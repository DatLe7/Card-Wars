import type { GameState, Player, PlayerGameState } from '../game';
import type { Actions } from '.';

const laneIndexes = [0, 1, 2, 3] as const;

export function getAvailableActions(
  playerId: string,
  game: GameState,
  player?: Player,
  playerGame?: PlayerGameState,
): Actions[] {
  if (playerId !== game.turn.activePlayerId) return [];

  switch (game.turn.phase) {
  case 'READY':
    return [{ type: 'NEXT_TURN', playerId }];
  case 'BATTLE':
    return laneIndexes
      .filter((laneIndex) =>
        Object.values(game.players).some(
          (playerState) =>
            playerState.lands[laneIndex]?.creature !== undefined,
        ),
      )
      .map((laneIndex) => ({
        type: 'SELECT_BATTLE_LANE',
        playerId,
        laneIndex,
      }));
  case 'MAIN': {
    /* v8 ignore if -- @preserve */
    if (player === undefined || playerGame === undefined) return [];

    const playCardActions = playerGame.hand.flatMap((card) => {
      const hasEnoughActions = card.cost <= playerGame.actionPoints;
      const matchingLandscapeCount = player.decklist.landscape.filter(
        (landscape) => landscape === card.land,
      ).length;
      const hasEnoughLandscapes =
        card.land === 'Rainbow' || matchingLandscapeCount >= card.cost;

      /* v8 ignore if -- @preserve */
      if (!hasEnoughActions || !hasEnoughLandscapes) return [];

      if (card.type === 'spell') {
        return [
          {
            type: 'PLAY_CARD' as const,
            playerId,
            cardInstanceId: card.instanceId,
          } as Actions,
        ];
      }

      return laneIndexes.map((laneIndex) => ({
        type: 'PLAY_CARD' as const,
        playerId,
        cardInstanceId: card.instanceId,
        laneIndex,
      }));
    });

    const drawCardActions: Actions[] =
      playerGame.actionPoints > 0
        ? [
          {
            type: 'DRAW_CARD',
            playerId,
          },
        ]
        : [];

    return [
      {
        type: 'NEXT_TURN',
        playerId,
      },
      ...drawCardActions,
      ...playCardActions,
    ];
  }
  }
}
