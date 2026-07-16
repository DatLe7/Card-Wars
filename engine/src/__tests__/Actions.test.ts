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

  it('decks are shuffled on game start', () => {
    const firstGame = createTestGame();
    const secondGame = createTestGame();

    const firstStartingHand = firstGame
      .getPlayerView('p1')
      .game.hand.map((card) => card.instanceId);
    const secondStartingHand = secondGame
      .getPlayerView('p1')
      .game.hand.map((card) => card.instanceId);

    expect(firstStartingHand).not.toEqual(secondStartingHand);
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

  it('commanding next turn gives the active player 2 action points', () => {
    const game = createTestGame();

    game.command({
      type: 'NEXT_TURN',
      playerId: 'p1',
    });

    const view = game.getPlayerView('p1');

    expect(view.game.actionPoints).toBe(2);
  });

  it('commanding next turn draws a card for the active player', () => {
    const game = createTestGame();

    game.command({
      type: 'NEXT_TURN',
      playerId: 'p1',
    });

    const view = game.getPlayerView('p1');

    expect(view.game.hand).toHaveLength(6);
    expect(view.game.deckCardCount).toBe(34);
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

describe('MAIN', () => {
  it('has 6 playable cards', () => {
    const game = createTestGame();

    game.command({
      type: 'NEXT_TURN',
      playerId: 'p1',
    });

    const playableCardIds = new Set(
      game
        .getAvailableActions('p1')
        .filter((action) => action.type === 'PLAY_CARD')
        .map((action) => action.cardInstanceId),
    );

    expect(playableCardIds.size).toBe(6);
  });
  it('a spell card has not land target', () => {
    let game = createTestGame();
    let spellCard = game
      .getPlayerView('p1')
      .game.hand.find((card) => card.type === 'spell');

    while (spellCard === undefined) {
      game = createTestGame();
      spellCard = game
        .getPlayerView('p1')
        .game.hand.find((card) => card.type === 'spell');
      console.log(spellCard);
    }

    game.command({
      type: 'NEXT_TURN',
      playerId: 'p1',
    });

    const playSpellAction = game
      .getAvailableActions('p1')
      .find(
        (action) =>
          action.type === 'PLAY_CARD' &&
          action.cardInstanceId === spellCard.instanceId,
      );

    expect(playSpellAction).toBeDefined();
    expect(playSpellAction).not.toHaveProperty('laneIndex');
  });
});
