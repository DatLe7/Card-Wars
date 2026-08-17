import { describe, expect, it } from 'vitest';

import {
  createTestGame,
  createTestGameWithCardInHand,
  playCard,
} from './testutils.js';

describe('BATTLE', () => {
  it('first battle phase is skipped', () => {
    const game = createTestGame();

    game.command({ type: 'NEXT_TURN', playerId: 'p1' });
    game.command({ type: 'NEXT_TURN', playerId: 'p1' });

    const view = game.getPlayerView('p2');

    expect(view.turn.activePlayerId).toBe('p2');
  });
  it('Select battle lane command is available when creatures are played', () => {
    const targetLandIndex = 0;
    const { game, card: creatureCard } = 
  		createTestGameWithCardInHand('creature');

    game.command({ type: 'NEXT_TURN', playerId: 'p1' });
    playCard(game, 'p1', creatureCard.instanceId, targetLandIndex);
    game.command({ type: 'NEXT_TURN', playerId: 'p1' });

    game.command({ type: 'NEXT_TURN', playerId: 'p2' });
    game.command({ type: 'NEXT_TURN', playerId: 'p2' });

    const availableActions = game.getAvailableActions('p2');

    expect(availableActions).toContainEqual({
      type: 'SELECT_BATTLE_LANE',
      laneIndex: targetLandIndex,
      playerId: 'p2',
    });
  });
});
