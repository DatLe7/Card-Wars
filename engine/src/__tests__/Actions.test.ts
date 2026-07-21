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
      .game.player.hand.map((card) => card.instanceId);
    const secondStartingHand = secondGame
      .getPlayerView('p1')
      .game.player.hand.map((card) => card.instanceId);

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

    expect(view.game.player.actionPoints).toBe(2);
  });

  it('commanding next turn draws a card for the active player', () => {
    const game = createTestGame();

    game.command({
      type: 'NEXT_TURN',
      playerId: 'p1',
    });

    const view = game.getPlayerView('p1');

    expect(view.game.player.hand).toHaveLength(6);
    expect(view.game.player.deckCardCount).toBe(34);
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
      .game.player.hand.find((card) => card.type === 'spell');

    while (spellCard === undefined) {
      game = createTestGame();
      spellCard = game
        .getPlayerView('p1')
        .game.player.hand.find((card) => card.type === 'spell');
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

  it('a creature card has a play card action', () => {
    let game = createTestGame();
    let creatureCard = game
      .getPlayerView('p1')
      .game.player.hand.find((card) => card.type === 'creature');

    while (creatureCard === undefined) {
      game = createTestGame();
      creatureCard = game
        .getPlayerView('p1')
        .game.player.hand.find((card) => card.type === 'creature');
    }

    game.command({
      type: 'NEXT_TURN',
      playerId: 'p1',
    });

    const playCreatureAction = game
      .getAvailableActions('p1')
      .find(
        (action) =>
          action.type === 'PLAY_CARD' &&
          action.cardInstanceId === creatureCard.instanceId,
      );

    expect(playCreatureAction).toBeDefined();
  });

  it('a building card has a play card action', () => {
    let game = createTestGame();
    let buildingCard = game
      .getPlayerView('p1')
      .game.player.hand.find((card) => card.type === 'building');

    while (buildingCard === undefined) {
      game = createTestGame();
      buildingCard = game
        .getPlayerView('p1')
        .game.player.hand.find((card) => card.type === 'building');
    }

    game.command({
      type: 'NEXT_TURN',
      playerId: 'p1',
    });

    const playBuildingAction = game
      .getAvailableActions('p1')
      .find(
        (action) =>
          action.type === 'PLAY_CARD' &&
          action.cardInstanceId === buildingCard.instanceId,
      );

    expect(playBuildingAction).toBeDefined();
  });

  it('commanding a play card action reduces action points by the cards cost', () => {
    const game = createTestGame();

    game.command({
      type: 'NEXT_TURN',
      playerId: 'p1',
    });

    const viewBeforePlayingCard = game.getPlayerView('p1');
    const card = viewBeforePlayingCard.game.player.hand.find(
      (handCard) => handCard.cost > 0,
    );

    expect(card).toBeDefined();

    if (card === undefined) {
      return;
    }

    const playCardAction = game
      .getAvailableActions('p1')
      .find(
        (action) =>
          action.type === 'PLAY_CARD' &&
          action.cardInstanceId === card.instanceId,
      );

    expect(playCardAction).toBeDefined();

    if (playCardAction === undefined) {
      return;
    }

    game.command(playCardAction);

    const viewAfterPlayingCard = game.getPlayerView('p1');

    expect(viewAfterPlayingCard.game.player.actionPoints).toBe(
      viewBeforePlayingCard.game.player.actionPoints - card.cost,
    );
  });

  it('commanding a play card action removes the card from the hand', () => {
    const game = createTestGame();

    game.command({
      type: 'NEXT_TURN',
      playerId: 'p1',
    });

    const playCardAction = game
      .getAvailableActions('p1')
      .find((action) => action.type === 'PLAY_CARD');

    expect(playCardAction).toBeDefined();

    if (playCardAction === undefined) {
      return;
    }

    game.command(playCardAction);

    const view = game.getPlayerView('p1');
    const cardInHand = view.game.player.hand.find(
      (card) => card.instanceId === playCardAction.cardInstanceId,
    );

    expect(cardInHand).toBeUndefined();
  });

  it('commanding a play card on a spell moves it into the graveyard', () => {
    let game = createTestGame();
    let spellCard = game
      .getPlayerView('p1')
      .game.player.hand.find((card) => card.type === 'spell');

    while (spellCard === undefined) {
      game = createTestGame();
      spellCard = game
        .getPlayerView('p1')
        .game.player.hand.find((card) => card.type === 'spell');
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

    if (playSpellAction === undefined) {
      return;
    }

    game.command(playSpellAction);

    const view = game.getPlayerView('p1');
    const cardInGraveyard = view.game.player.graveyard.find(
      (card) => card.instanceId === spellCard.instanceId,
    );

    expect(cardInGraveyard).toBeDefined();
  });

  // The following 2 dont implement yet. I need to determine some things first
  // commanding a play card action on a creature moves it to the target land
  // commanding a play card action on a building moves it to the target land
});
