import type { CreateGameInput, GlobalView, Player, PlayerView, Turn } from '.';
import type { GameState, PlayerGameState } from '.';
import { initializeDeck } from '../card/card';

export class Game {
  private readonly players: Player[];
  private game: GameState;
  private turn: Turn;

  constructor(input: CreateGameInput) {
    this.players = input.players.map((player) => ({ ...player }));
    this.game = {
      players: Object.fromEntries(
        this.players.map((player) => [player.id, this.createPlayerGameState(player)]),
      ),
    };
    this.turn = {
      number: 1,
      activePlayerId: input.firstPlayer,
      phase: 'READY',
    };
  }

  private createPlayerGameState(player: Player): PlayerGameState {
    const deck = initializeDeck(player.id, player.decklist.deck);

    return {
      deck: deck.slice(5),
      hand: deck.slice(0, 5),
      graveyard: [],
    };
  }

  getPlayerView(playerId: string): PlayerView {
    const player = this.players.find((candidate) => candidate.id === playerId);
    const playerGame = this.game.players[playerId];

    if (player === undefined || playerGame === undefined) {
      throw new Error(`Player ${playerId} was not found in this game.`);
    }

    return {
      ...player,
      turn: { ...this.turn },
      game: {
        deckCardCount: playerGame.deck.length,
        hand: [...playerGame.hand],
        graveyard: [...playerGame.graveyard],
      },
    };
  }

  getTurn(): Turn {
    return { ...this.turn };
  }

  getGlobalView(): GlobalView {
    return {
      turn: { ...this.turn },
      game: {
        players: Object.fromEntries(
          Object.entries(this.game.players).map(([playerId, playerGame]) => [
            playerId,
            {
              deck: [...playerGame.deck],
              hand: [...playerGame.hand],
              graveyard: [...playerGame.graveyard],
            },
          ]),
        ),
      },
    };
  }
}
