import type { CardDefinition, DecklistEntry } from '../game';
import type { CardInstance } from '.';

import definitions from '../data/definitions.json';

const cardDefinitions = definitions as readonly CardDefinition[];

const cardDefinitionsById = new Map(
  cardDefinitions.map((definition) => [definition.id, definition]),
);

export function createCardInstances(
  ownerId: string,
  entry: DecklistEntry,
): CardInstance[] {
  const definition = cardDefinitionsById.get(entry.cardId);

  if (definition === undefined) {
    throw new Error(`Card definition ${entry.cardId} was not found.`);
  }

  return Array.from({ length: entry.count }, (_, index) => ({
    instanceId: `${ownerId}_${entry.cardId}_${index + 1}`,
    ownerId,
    cardId: entry.cardId,
    name: definition.name,
    type: definition.cardType,
    land: definition.land,
    cost: definition.cost,
    attack: definition.attack ?? 0,
    defence: definition.defense ?? 0,
    atkMod: 0,
    defMod: 0,
    damage: 0,
    canFloop: definition.cardType === 'creature',
    isFlooped: false,
  }));
}

export function initializeDeck(
  ownerId: string,
  decklist: readonly DecklistEntry[],
): CardInstance[] {
  return decklist.flatMap((entry) => createCardInstances(ownerId, entry));
}
