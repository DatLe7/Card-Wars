import { describe, expect, it } from 'vitest';

import { createTestGame } from './testutils.js';

describe('Ready Phase', () => {
  it('ready phase starting player actions', () => {
    const game = createTestGame();

    expect(game.getAvailableActions('p1')).toEqual([
      {
        type: 'NEXT_TURN',
        playerId: 'p1',
      },
    ]);
  });

  it('ready phase non starting player no actions', () => {
    const game = createTestGame();

    expect(game.getAvailableActions('p2')).toEqual([]);
  });

  it('commanding next turn takes turn to main', () => {
    const game = createTestGame();

    game.command({
      type: 'NEXT_TURN',
      playerId: 'p1',
    });

    const view = game.getPlayerView('p2');

    expect(view.turn.phase).toBe('MAIN');
  });

  it('does not allow non turn player use next turn command', () => {
    const game = createTestGame();

    game.command({
      type: 'NEXT_TURN',
      playerId: 'p2',
    });

    const view = game.getPlayerView('p1');

    expect(view.turn.phase).toBe('READY');
  });
});
