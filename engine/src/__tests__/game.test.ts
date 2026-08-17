import { beforeEach, describe, expect, it } from 'vitest';

import { Game } from '../game/game.js';
import { createTestGame } from './testutils.js';

describe('create game', () => {
  let game: Game;
  beforeEach(() => {
    game = createTestGame({
      gameId: 'game_123',
      playerOneName: 'Me',
      playerTwoName: 'Opponent',
    });
  });
  it('returns object', () => {
    expect(game).not.toBeUndefined();
  });

  it('assigns the correct player information', () => {
    const view = game.getPlayerView('p1');
    expect(view.id).toBe('p1');
  });

  it('assigns the correct player name', () => {
    const view = game.getPlayerView('p1');
    expect(view.name).toBe('Me');
  });

  it('throws when getting information for a non-player', () => {
    expect(() => game.getPlayerView('p3')).toThrow(
      'Player p3 was not found in this game.',
    );
  });

  it('starts in the first turn', () => {
    const view = game.getPlayerView('p1');
    expect(view.turn.number).toBe(1);
  });
  it('correct starting player', () => {
    const view = game.getPlayerView('p1');
    expect(view.turn.activePlayerId).toBe('p1');
  });
  it('correct starting player from opponent view', () => {
    const view = game.getPlayerView('p2');
    expect(view.turn.activePlayerId).toBe('p1');
  });
  it('correct starting phase', () => {
    const view = game.getPlayerView('p1');
    expect(view.turn.phase).toBe('READY');
  });
});

describe('getGlobalView', () => {
  let game: Game;

  beforeEach(() => {
    game = createTestGame({
      gameId: 'game_456',
    });
  });

  it('returns the current turn', () => {
    const view = game.getGlobalView();

    expect(view.turn).toEqual({
      number: 1,
      activePlayerId: 'p1',
      phase: 'READY',
    });
  });

  it('returns game state for every player', () => {
    const view = game.getGlobalView();

    expect(Object.keys(view.game.players)).toEqual(['p1', 'p2']);
  });

  it('returns each player initial deck hand and graveyard', () => {
    const view = game.getGlobalView();
    const p1 = view.game.players.p1;
    const p2 = view.game.players.p2;

    expect(p1).toBeDefined();
    expect(p2).toBeDefined();
    expect(p1?.deck).toHaveLength(35);
    expect(p1?.hand).toHaveLength(5);
    expect(p1?.graveyard).toHaveLength(0);
    expect(p2?.deck).toHaveLength(35);
    expect(p2?.hand).toHaveLength(5);
    expect(p2?.graveyard).toHaveLength(0);
  });

  it('returns cards owned by the matching player', () => {
    const view = game.getGlobalView();

    expect(view.game.players.p1?.hand.every((card) => card.ownerId === 'p1')).toBe(
      true,
    );
    expect(view.game.players.p2?.hand.every((card) => card.ownerId === 'p2')).toBe(
      true,
    );
  });

  it('does not expose internal zone arrays', () => {
    const view = game.getGlobalView();

    view.game.players.p1?.hand.pop();
    view.game.players.p1?.deck.pop();

    const nextView = game.getGlobalView();

    expect(nextView.game.players.p1?.hand).toHaveLength(5);
    expect(nextView.game.players.p1?.deck).toHaveLength(35);
  });

  it('both players start at 25 life', () => {
    const view = game.getGlobalView();

    expect([
      view.game.players.p1?.life,
      view.game.players.p2?.life,
    ]).toEqual([25, 25]);
  });

  it('shows 4 lands', () => {
    const view = game.getGlobalView();

    expect(view.game.players.p1.lands.length).toBe(4);
  });

  it('has no creatures on lands', () => {
    const view = game.getGlobalView();

    expect(
      view.game.players.p2.lands.every((land) => land.creature === undefined),
    ).toBe(true);
  });

  it('has no buildings on your lands', () => {
    const view = game.getGlobalView();
    expect(
      view.game.players.p1.lands.every((land) => land.building === undefined),
    ).toBe(true);
  });
});

describe('READY', () => {
  let game: Game;
  beforeEach(() => {
    game = createTestGame({
      gameId: 'game_321',
    });
  });
  it('5 cards initially in hand', () => {
    const view = game.getPlayerView('p1');
    expect(view.game.player.hand.length).toBe(5);
  });

  it('35 cards initially in deck', () => {
    const view = game.getPlayerView('p1');
    expect(view.game.player.deckCardCount).toBe(35);
  });

  it('0 cards initially in graveyard', () => {
    const view = game.getPlayerView('p1');
    expect(view.game.player.graveyard.length).toBe(0);
  });

  it('first card in hand has an instance id', () => {
    const view = game.getPlayerView('p1');
    expect(view.game.player.hand[0]?.instanceId).toBeDefined();
  });

  it('second card in hand has an instance id', () => {
    const view = game.getPlayerView('p1');
    expect(view.game.player.hand[1]?.instanceId).toBeDefined();
  });

  it('cards in hand match the card instance shape', () => {
    const view = game.getPlayerView('p1');

    view.game.player.hand.forEach((card) => {
      expect(card).toEqual({
        instanceId: expect.any(String),
        ownerId: expect.any(String),
        cardId: expect.any(String),
        name: expect.any(String),
        type: expect.any(String),
        land: expect.any(String),
        cost: expect.any(Number),
        attack: expect.any(Number),
        defence: expect.any(Number),
        atkMod: expect.any(Number),
        defMod: expect.any(Number),
        damage: expect.any(Number),
        canFloop: expect.any(Boolean),
        isFlooped: expect.any(Boolean),
      });
    });
  });

  it('first card in deck has a instance id in player 1', () => {
    const view = game.getGlobalView();
    expect(view.game.players.p1?.deck[0]?.instanceId).toBeDefined();
  });
  it('shows 35 cards in enemy deck', () => {
    const view = game.getPlayerView('p1');

    expect(view.game.enemy.deckCardCount).toBe(35);
  });

  it('shows 5 cards in enemy hand', () => {
    const view = game.getPlayerView('p1');

    expect(view.game.enemy.handCardCount).toBe(5);
  });

  it('shows 0 cards in enemy graveyard', () => {
    const view = game.getPlayerView('p1');

    expect(view.game.enemy.graveyardCardCount).toBe(0);
  });

  it('shows 4 lands on your side', () => {
    const view = game.getPlayerView('p1');

    expect(view.game.player.lands.length).toBe(4);
  });

  it('shows 4 lands on opponent side', () => {
    const view = game.getPlayerView('p1');

    expect(view.game.enemy.lands.length).toBe(4);
  });

  it('has no creatures on your lands', () => {
    const view = game.getPlayerView('p1');

    expect(
      view.game.player.lands.every((land) => land.creature === undefined),
    ).toBe(true);
  });

  it('has no creatures on opponent lands', () => {
    const view = game.getPlayerView('p1');

    expect(
      view.game.enemy.lands.every((land) => land.creature === undefined),
    ).toBe(true);
  });

  it('has no buildings on your lands', () => {
    const view = game.getPlayerView('p1');

    expect(
      view.game.player.lands.every((land) => land.building === undefined),
    ).toBe(true);
  });

  it('has no buildings on opponent lands', () => {
    const view = game.getPlayerView('p1');

    expect(
      view.game.enemy.lands.every((land) => land.building === undefined),
    ).toBe(true);
  });
});
