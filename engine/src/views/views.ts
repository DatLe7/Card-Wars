import type { GameState, Player } from '../game';
import type { GlobalView, PlayerView } from '.';

export function getPlayerView(
  playerId: string,
  players: readonly Player[],
  game: GameState,
): PlayerView {
  const player = players.find((candidate) => candidate.id === playerId);
  const playerGame = game.players[playerId];
  const enemy = players.find((candidate) => candidate.id !== playerId);
  const enemyGame = enemy === undefined ? undefined : game.players[enemy.id];

  if (
    player === undefined ||
    playerGame === undefined ||
    enemy === undefined ||
    enemyGame === undefined
  ) {
    throw new Error(`Player ${playerId} was not found in this game.`);
  }

  return {
    ...player,
    turn: { ...game.turn },
    game: {
      player: {
        life: playerGame.life,
        actionPoints: playerGame.actionPoints,
        deckCardCount: playerGame.deck.length,
        hand: [...playerGame.hand],
        graveyard: [...playerGame.graveyard],
        lands: playerGame.lands.map((land) => ({ ...land })),
      },
      enemy: {
        life: enemyGame.life,
        deckCardCount: enemyGame.deck.length,
        handCardCount: enemyGame.hand.length,
        graveyardCardCount: enemyGame.graveyard.length,
        lands: enemyGame.lands.map((land) => ({ ...land })),
      },
    },
  };
}

export function getGlobalView(game: GameState): GlobalView {
  return {
    turn: { ...game.turn },
    game: {
      players: Object.fromEntries(
        Object.entries(game.players).map(([playerId, playerGame]) => [
          playerId,
          {
            life: playerGame.life,
            actionPoints: playerGame.actionPoints,
            deck: [...playerGame.deck],
            hand: [...playerGame.hand],
            graveyard: [...playerGame.graveyard],
            lands: playerGame.lands.map((land) => ({ ...land })),
          },
        ]),
      ),
    },
  };
}
