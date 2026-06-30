import { beforeEach, describe, expect, it } from 'vitest';
import { createCardInstances, initializeDeck } from '../card/card';
import type { CardInstance } from '../card';

import finnDecklist from '../data/finn.json';

describe('card instance creation', () => {
  let cardInstance: CardInstance;

  beforeEach(() => {
    cardInstance = createCardInstances('p1', finnDecklist.deck[0])[0] as CardInstance;
  });

  it('returns object', () => {
    expect(cardInstance).toBeDefined();
  });

  it('sets instanceId', () => {
    expect(cardInstance.instanceId).toBe('p1_ancient_scholar_1');
  });

  it('sets ownerId', () => {
    expect(cardInstance.ownerId).toBe('p1');
  });

  it('sets cardId', () => {
    expect(cardInstance.cardId).toBe('ancient_scholar');
  });

  it('sets name', () => {
    expect(cardInstance.name).toBe('Ancient Scholar');
  });

  it('sets type', () => {
    expect(cardInstance.type).toBe('creature');
  });

  it('sets land', () => {
    expect(cardInstance.land).toBe('Blue Plains');
  });

  it('sets cost', () => {
    expect(cardInstance.cost).toBe(1);
  });

  it('sets attack', () => {
    expect(cardInstance.attack).toBe(1);
  });

  it('sets defence', () => {
    expect(cardInstance.defence).toBe(7);
  });

  it('sets atkMod', () => {
    expect(cardInstance.atkMod).toBe(0);
  });

  it('sets defMod', () => {
    expect(cardInstance.defMod).toBe(0);
  });

  it('sets damage', () => {
    expect(cardInstance.damage).toBe(0);
  });

  it('sets canFloop', () => {
    expect(cardInstance.canFloop).toBe(true);
  });

  it('sets isFlooped', () => {
    expect(cardInstance.isFlooped).toBe(false);
  });
});

describe('Initialize Deck', () => {
  it('returns object', () => {
    const deck = initializeDeck('p1', finnDecklist.deck);
    expect(deck).toBeDefined();
  });

  it('initalizes 40 card instances', () => {
    const deck = initializeDeck('p1', finnDecklist.deck);
    expect(deck).toHaveLength(40);
  });
});
