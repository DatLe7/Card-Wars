import type { GameState, LaneIndex } from '../game';
import type { Actions } from '.';

export function commandActions(
  action: Actions,
  game: GameState,
): void {
  switch (action.type) {
  case 'NEXT_TURN': {
    const playerGameState = game.players[action.playerId];

    /* v8 ignore if -- @preserve */
    if (playerGameState === undefined) return;

    switch (game.turn.phase) {
    case 'READY': {
      const drawnCard = playerGameState.deck.shift();

      playerGameState.actionPoints = 2;

      /* v8 ignore if -- @preserve */
      if (drawnCard !== undefined) {
        playerGameState.hand.push(drawnCard);
      }

      game.turn.phase = 'MAIN';
      break;
    }
    case 'MAIN': {
      const drawnCards = playerGameState.deck.splice(
        0,
        playerGameState.actionPoints,
      );

      playerGameState.hand.push(...drawnCards);
      playerGameState.actionPoints = 0;

      if (game.turn.number === 1) {
        const nextPlayerId = Object.keys(game.players).find(
          (playerId) => playerId !== action.playerId,
        );

        /* v8 ignore if -- @preserve */
        if (nextPlayerId === undefined) return;

        game.turn.number++;
        game.turn.activePlayerId = nextPlayerId;
        game.turn.phase = 'READY';
      } else {
        game.turn.phase = 'BATTLE';
        const laneIndexes: LaneIndex[] = [0,1,2,3];
        game.remainingBattleLanes = laneIndexes.filter((laneIndex) =>
          Object.values(game.players).some(
            (player) => player.lands[laneIndex]?.creature !== undefined,
          ),
        );
      }

      break;
    }
    case 'BATTLE': {
      const nextPlayerId = Object.keys(game.players).find(
        (playerId) => playerId !== action.playerId,
      );

      /* v8 ignore if -- @preserve */
      if (nextPlayerId === undefined) return;

      game.turn.number++;
      game.turn.activePlayerId = nextPlayerId;
      game.turn.phase = 'READY';
      break;
    }
    }

    break;
  }
  case 'DRAW_CARD': {
    const playerGameState = game.players[action.playerId];

    /* v8 ignore if -- @preserve */
    if (playerGameState === undefined) return;

    const drawnCard = playerGameState.deck.shift();

    /* v8 ignore if -- @preserve */
    if (drawnCard !== undefined) {
      playerGameState.hand.push(drawnCard);
    }

    playerGameState.actionPoints -= 1;

    break;
  }
  case 'PLAY_CARD': {
    const playerGameState = game.players[action.playerId];

    /* v8 ignore if -- @preserve */
    if (playerGameState === undefined) return;

    const cardIndex = playerGameState.hand.findIndex(
      (card) => card.instanceId === action.cardInstanceId,
    );

    /* v8 ignore if -- @preserve */
    if (cardIndex === -1) return;

    const cardToPlay = playerGameState.hand[cardIndex];
    const targetLand = playerGameState.lands[action.laneIndex];

    /* v8 ignore if -- @preserve */
    if (
      (cardToPlay?.type === 'creature' || cardToPlay?.type === 'building') &&
      targetLand === undefined
    ) return;

    const [playedCard] = playerGameState.hand.splice(cardIndex, 1);

    /* v8 ignore if -- @preserve */
    if (playedCard === undefined) return;

    playerGameState.actionPoints -= playedCard.cost;

    if (playedCard.type === 'spell') {
      playerGameState.graveyard.push(playedCard);
    }

    if (playedCard.type === 'creature' && targetLand !== undefined) {
      targetLand.creature = playedCard;
    }

    if (playedCard.type === 'building' && targetLand !== undefined) {
      targetLand.building = playedCard;
    }

    break;
  }
  case 'SELECT_BATTLE_LANE': {
    const laneIndex = action.laneIndex;
    const playerGameState = game.players[action.playerId];
    const opponentGameState = Object.entries(game.players).find(
      ([playerId]) => playerId !== action.playerId,
    )?.[1];
    const playerCreature = playerGameState?.lands[laneIndex]?.creature;
    const opponentCreature = opponentGameState?.lands[laneIndex]?.creature;

    /* v8 ignore if -- @preserve */
    if (playerGameState === undefined || opponentGameState === undefined) return;

    game.remainingBattleLanes = game.remainingBattleLanes.filter(index => index !== laneIndex);

    if (playerCreature !== undefined && opponentCreature !== undefined) {
      playerCreature.damage += opponentCreature.attack + opponentCreature.atkMod;
      opponentCreature.damage += playerCreature.attack + playerCreature.atkMod;
    } else if (playerCreature !== undefined) {
      opponentGameState.life -= (playerCreature.attack + playerCreature.atkMod);
    } else if (opponentCreature !== undefined) {
      playerGameState.life -= (opponentCreature.attack + opponentCreature.atkMod);
    }
  }
  }
}
