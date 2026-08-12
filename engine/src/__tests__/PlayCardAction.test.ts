import { describe, expect, it } from 'vitest';

import {
  createTestGame,
  createTestGameWithCardInHand,
  playCard,
} from './testutils.js';

describe('PLAY_CARD', () => {
  it('has 6 playable cards', () => {
    const game = createTestGame();

    game.command({ type: 'NEXT_TURN', playerId: 'p1' });

    const playableCardIds = new Set(
      game
        .getAvailableActions('p1')
        .filter((action) => action.type === 'PLAY_CARD')
        .map((action) => action.cardInstanceId),
    );

    expect(playableCardIds.size).toBe(6);
  });

  it('a spell card has no land target', () => {
    const { game, card: spellCard } = createTestGameWithCardInHand('spell');

    game.command({ type: 'NEXT_TURN', playerId: 'p1' });

    const playSpellAction = game
      .getAvailableActions('p1')
      .find(
        (action) =>
          action.type === 'PLAY_CARD' &&
          action.cardInstanceId === spellCard.instanceId,
      );

    expect(playSpellAction).not.toHaveProperty('laneIndex');
  });

  it('a creature card has a play card action', () => {
    const { game, card: creatureCard } =
      createTestGameWithCardInHand('creature');

    game.command({ type: 'NEXT_TURN', playerId: 'p1' });

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
    const { game, card: buildingCard } =
      createTestGameWithCardInHand('building');

    game.command({ type: 'NEXT_TURN', playerId: 'p1' });

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

    game.command({ type: 'NEXT_TURN', playerId: 'p1' });

    const card = game.getPlayerView('p1').game.player.hand[0];

    playCard(game, card.instanceId);

    const view = game.getPlayerView('p1');

    expect(view.game.player.actionPoints).toBe(2 - card.cost);
  });

  it('commanding a play card action removes the card from the hand', () => {
    const game = createTestGame();

    game.command({ type: 'NEXT_TURN', playerId: 'p1' });

    const card = game.getPlayerView('p1').game.player.hand[0];

    playCard(game, card.instanceId);

    const view = game.getPlayerView('p1');
    const cardInHand = view.game.player.hand.find(
      (handCard) => handCard.instanceId === card.instanceId,
    );

    expect(cardInHand).toBeUndefined();
  });

  it('commanding a play card on a spell moves it into the graveyard', () => {
    const { game, card: spellCard } = createTestGameWithCardInHand('spell');

    game.command({ type: 'NEXT_TURN', playerId: 'p1' });
    playCard(game, spellCard.instanceId);

    const view = game.getPlayerView('p1');
    const cardInGraveyard = view.game.player.graveyard.find(
      (card) => card.instanceId === spellCard.instanceId,
    );

    expect(cardInGraveyard).toBeDefined();
  });

  it('commanding a play card action on a creature moves it to the target land', () => {
    const { game, card: creatureCard } =
      createTestGameWithCardInHand('creature');

    game.command({ type: 'NEXT_TURN', playerId: 'p1' });

    const targetLandIndex = 2;
    playCard(game, creatureCard.instanceId, targetLandIndex);

    const view = game.getPlayerView('p1');

    expect(
      view.game.player.lands[targetLandIndex]?.creature?.instanceId,
    ).toBe(creatureCard.instanceId);
  });

  it('opponent player view shows a played creature on the target land', () => {
    const { game, card: creatureCard } =
      createTestGameWithCardInHand('creature');

    game.command({ type: 'NEXT_TURN', playerId: 'p1' });

    const targetLandIndex = 1;
    playCard(game, creatureCard.instanceId, targetLandIndex);

    const opponentView = game.getPlayerView('p2');

    expect(
      opponentView.game.enemy.lands[targetLandIndex]?.creature?.instanceId,
    ).toBe(creatureCard.instanceId);
  });

  it('commanding a play card action on a building moves it to the target land', () => {
    const targetLandIndex = 3;
    const { game, card: buildingCard } =
      createTestGameWithCardInHand('building');

    game.command({ type: 'NEXT_TURN', playerId: 'p1' });
    playCard(game, buildingCard.instanceId, targetLandIndex);

    const view = game.getPlayerView('p1');

    expect(view.game.player.lands[targetLandIndex]?.building?.instanceId).toBe(
      buildingCard.instanceId,
    );
  });

  it('opponent player view shows a played building on the target land', () => {
    const targetLandIndex = 3;
    const { game, card: buildingCard } =
      createTestGameWithCardInHand('building');

    game.command({ type: 'NEXT_TURN', playerId: 'p1' });
    playCard(game, buildingCard.instanceId, targetLandIndex);

    const opponentView = game.getPlayerView('p2');

    expect(
      opponentView.game.enemy.lands[targetLandIndex]?.building?.instanceId,
    ).toBe(buildingCard.instanceId);
  });

  // card with action cost cannot be in available actions when at 0 action points
});
