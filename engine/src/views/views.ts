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

  if (player === undefined || playerGame === undefined) {
    throw new Error(`Player ${playerId} was not found in this game.`);
  }

  return {
    ...player,
    turn: { ...turn },
    game: {
      actionPoints: playerGame.actionPoints,
      deckCardCount: playerGame.deck.length,
      hand: [...playerGame.hand],
      graveyard: [...playerGame.graveyard],
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
          },
        ]),
      ),
    },
  };
}
