import { beforeEach, describe, expect, it } from 'vitest';

import type { Game } from '../game/game.js';
import { createTestGame } from './testutils.js';

describe('DRAW_CARD', () => {
  let game: Game;

  beforeEach(() => {
    game = createTestGame();
    game.command({
      type: 'NEXT_TURN',
      playerId: 'p1',
    });
  });

  it('draw card action is shown in available actions during main phase', () => {

    const availableActions = game.getAvailableActions('p1');

    expect(availableActions).toContainEqual({
      type: 'DRAW_CARD',
      playerId: 'p1',
    });
  });

  it('draw card action increases cards in hand by 1', () => {
    game.command({ type: 'DRAW_CARD', playerId: 'p1' });

    const view = game.getPlayerView('p1');

    expect(view.game.player.hand).toHaveLength(7);
  });

  it('draw card action decreases cards in deck by 1', () => {
    game.command({ type: 'DRAW_CARD', playerId: 'p1' });

    const view = game.getPlayerView('p1');

    expect(view.game.player.deckCardCount).toBe(33);
  });

  it('draw card action reduces action points by 1', () => {
    game.command({ type: 'DRAW_CARD', playerId: 'p1' });

    const view = game.getPlayerView('p1');

    expect(view.game.player.actionPoints).toBe(1);
  });

  it('draw card is not an available action at 0 action points', () => {
    game.command({ type: 'DRAW_CARD', playerId: 'p1' });
    game.command({ type: 'DRAW_CARD', playerId: 'p1' });

    const drawCardActions = game
      .getAvailableActions('p1')
      .filter((action) => action.type === 'DRAW_CARD');

    expect(drawCardActions).toHaveLength(0);
  });

  it('next turn action with 2 action points left in main draws 2 cards', () => {
    game.command({ type: 'NEXT_TURN', playerId: 'p1' });

    const view = game.getPlayerView('p1');

    expect(view.game.player.hand).toHaveLength(8);
  });
});
