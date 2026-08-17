import { describe, expect, it } from 'vitest';

import { createTestGame } from './testutils.js';

describe('BATTLE', () => {
  it('first battle phase is skipped', () => {
    const game = createTestGame();

    game.command({ type: 'NEXT_TURN', playerId: 'p1' });
    game.command({ type: 'NEXT_TURN', playerId: 'p1' });

    const view = game.getPlayerView('p2');

    expect(view.turn.activePlayerId).toBe('p2');
  });
});
