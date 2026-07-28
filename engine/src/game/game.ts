import type { Actions } from '../actions';
import type { GameState, PlayerGameState } from '.';
import type { CreateGameInput, Player, Turn } from '.';
import { getAvailableActions } from '../actions/availableActions';
import { commandActions } from '../actions/commandActions';
import { initializeDeck } from '../card/card';
import { getGlobalView, getPlayerView } from '../views';
import type { GlobalView, PlayerView } from '../views';
import { initializeLands } from './land';

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
      actionPoints: 0,
      deck: deck.slice(5),
      hand: deck.slice(0, 5),
      graveyard: [],
      lands: initializeLands(player.decklist.landscape),
    };
  }

  getPlayerView(playerId: string): PlayerView {
    return getPlayerView(playerId, this.players, this.game, this.turn);
  }

  getGlobalView(): GlobalView {
    return getGlobalView(this.game, this.turn);
  }

  getAvailableActions(playerId: string): Actions[] {
    const player = this.players.find((candidate) => candidate.id === playerId);
    const playerGame = this.game.players[playerId];

    return getAvailableActions(playerId, this.turn, player, playerGame);
  }

  command(action: Actions): void {
    const actionIsAvailable = this.getAvailableActions(action.playerId).some(
      (availableAction) => availableAction.type === action.type,
    );

    if (!actionIsAvailable) {
      return;
    }

    commandActions(action, this.game, this.turn);
  }
}
