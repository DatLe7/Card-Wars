import type { GameState, Player, Turn } from '../game';
import type { GlobalView, PlayerView } from '.';

export function getPlayerView(
  playerId: string,
  players: readonly Player[],
  game: GameState,
  turn: Turn,
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
    turn: { ...turn },
    game: {
      player: {
        actionPoints: playerGame.actionPoints,
        deckCardCount: playerGame.deck.length,
        hand: [...playerGame.hand],
        graveyard: [...playerGame.graveyard],
        lands: playerGame.lands.map((land) => ({ ...land })),
      },
      enemy: {
        deckCardCount: enemyGame.deck.length,
        handCardCount: enemyGame.hand.length,
        graveyardCardCount: enemyGame.graveyard.length,
        lands: enemyGame.lands.map((land) => ({ ...land })),
      },
    },
  };
}

export function getGlobalView(game: GameState, turn: Turn): GlobalView {
  return {
    turn: { ...turn },
    game: {
      players: Object.fromEntries(
        Object.entries(game.players).map(([playerId, playerGame]) => [
          playerId,
          {
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
