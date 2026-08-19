import { describe, expect, it } from 'vitest';

import {
  createTestGame,
  createTestGameWithCardInHand,
  createTestGameWithCardsInHand,
  playCard,
} from './testutils.js';
import type { CardInstance } from '../card';
import type { LaneIndex } from '../game';
import type { Game } from '../game/game.js';

function completeBattles(
  game: Game,
  numberOfBattles: number,
  laneIndex: LaneIndex,
): void {
  for (let battle = 0; battle < numberOfBattles; battle += 1) {
    const activePlayerId = game.getGlobalView().turn.activePlayerId;

    game.command({
      type: 'SELECT_BATTLE_LANE',
      laneIndex,
      playerId: activePlayerId,
    });

    if (battle < numberOfBattles - 1) {
      game.command({ type: 'NEXT_TURN', playerId: activePlayerId });

      const nextPlayerId = game.getGlobalView().turn.activePlayerId;
      game.command({ type: 'NEXT_TURN', playerId: nextPlayerId });
      game.command({ type: 'NEXT_TURN', playerId: nextPlayerId });
    }
  }
}

function createGameWithCreaturePlayed(
  targetLandIndex: number
): { game: Game; card: CardInstance } {
  const { game, card } = createTestGameWithCardInHand('creature');

  game.command({ type: 'NEXT_TURN', playerId: 'p1' });
  playCard(game, 'p1', card.instanceId, targetLandIndex);
  game.command({ type: 'NEXT_TURN', playerId: 'p1' });
  // first battle phase is skipped so only 2 next turns

  game.command({ type: 'NEXT_TURN', playerId: 'p2' });
  game.command({ type: 'NEXT_TURN', playerId: 'p2' });

  return { game, card };
}

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
    const { game } = createGameWithCreaturePlayed(targetLandIndex);

    const availableActions = game.getAvailableActions('p2');

    expect(availableActions).toContainEqual({
      type: 'SELECT_BATTLE_LANE',
      laneIndex: targetLandIndex,
      playerId: 'p2',
    });
  });

  it('does not show select battle lane on lands with no creatures', () => {
    const targetLandIndex = 0;
    const { game } = createGameWithCreaturePlayed(targetLandIndex);

    const availableActions = game.getAvailableActions('p2');

    expect(availableActions).not.toContainEqual({
      type: 'SELECT_BATTLE_LANE',
      laneIndex: 2,
      playerId: 'p2',
    });
  });

  it('selecting a battle lane undefended make you lost life', () => {
    const targetLandIndex = 0;
    const { game, card } = createGameWithCreaturePlayed(targetLandIndex);

    game.command({
      type: 'SELECT_BATTLE_LANE',
      laneIndex: targetLandIndex,
      playerId: 'p2',
    });

    const view = game.getPlayerView('p1');

    expect(view.game.enemy.life).toBe(25 - (card.attack + card.atkMod));
  });

  it('next turn is not available until all available battle lanes have selected', () => {
    const targetLandIndex = 0;
    const { game } = createGameWithCreaturePlayed(targetLandIndex);
    const availableActions = game.getAvailableActions('p2');

    expect(availableActions).not.toContainEqual({
      type: 'NEXT_TURN',
      playerId: 'p2',
    });
  });

  it('next turn available after all battle lanes have been selected', () => {
    const targetLandIndex = 0;
    const { game } = createGameWithCreaturePlayed(targetLandIndex);

    game.command({
      type: 'SELECT_BATTLE_LANE',
      laneIndex: targetLandIndex,
      playerId: 'p2',
    });

    const availableActions = game.getAvailableActions('p2');

    expect(availableActions).toContainEqual({
      type: 'NEXT_TURN',
      playerId: 'p2',
    });
  });

  it('a lane can only battle once', () => {
    const targetLandIndex = 0;
    const { game } = createGameWithCreaturePlayed(targetLandIndex);

    game.command({
      type: 'SELECT_BATTLE_LANE',
      laneIndex: targetLandIndex,
      playerId: 'p2',
    });

    const availableActions = game.getAvailableActions('p2');

    expect(availableActions).not.toContainEqual({
      type: 'SELECT_BATTLE_LANE',
      laneIndex: targetLandIndex,
      playerId: 'p2',
    });
  });
  it('selecting a battle lane with own creature and no opposing creature will cause opponent damage', () => {
    const targetLandIndex = 0;
    const { game, card } = createGameWithCreaturePlayed(targetLandIndex);
    game.command({
      type: 'SELECT_BATTLE_LANE',
      laneIndex: targetLandIndex,
      playerId: 'p2',
    });
    game.command({ type: 'NEXT_TURN', playerId: 'p2' });

    game.command({ type: 'NEXT_TURN', playerId: 'p1' });
    game.command({ type: 'NEXT_TURN', playerId: 'p1' });

    game.command({
      type: 'SELECT_BATTLE_LANE',
      laneIndex: targetLandIndex,
      playerId: 'p1',
    });

    const view = game.getPlayerView('p1');

    expect(view.game.enemy.life).toBe(25 - (2 * (card.attack + card.atkMod)));
  });
  it('selecting a battle lane with 2 creatures will cause both to take damage', () => {
    const targetLandIndex = 0;
    const game = createTestGame({ shuffleDeck: false });

    game.command({ type: 'NEXT_TURN', playerId: 'p1' });
    const playerCreature = game
      .getPlayerView('p1')
      .game.player.hand.find((card) => card.type === 'creature')!;
    playCard(game, 'p1', playerCreature.instanceId, targetLandIndex);
    game.command({ type: 'NEXT_TURN', playerId: 'p1' });

    game.command({ type: 'NEXT_TURN', playerId: 'p2' });
    const opponentCreature = game
      .getPlayerView('p2')
      .game.player.hand.find((card) => card.type === 'creature')!;
    playCard(game, 'p2', opponentCreature.instanceId, targetLandIndex);
    game.command({ type: 'NEXT_TURN', playerId: 'p2' });

    game.command({
      type: 'SELECT_BATTLE_LANE',
      laneIndex: targetLandIndex,
      playerId: 'p2',
    });

    const view = game.getPlayerView('p1');

    expect([
      view.game.player.lands[targetLandIndex].creature?.damage,
      view.game.enemy.lands[targetLandIndex].creature?.damage,
    ]).toEqual([
      opponentCreature.attack + opponentCreature.atkMod,
      playerCreature.attack + playerCreature.atkMod,
    ]);
  });

  it('a creature dies upon taking enough damage', () => {
    const targetLandIndex = 0;
    const game = createTestGame({ shuffleDeck: false });

    game.command({ type: 'NEXT_TURN', playerId: 'p1' });
    const playerCreature = game
      .getPlayerView('p1')
      .game.player.hand.find((card) => card.cardId === 'archer_dan')!;
    playCard(game, 'p1', playerCreature.instanceId, targetLandIndex);
    game.command({ type: 'NEXT_TURN', playerId: 'p1' });

    game.command({ type: 'NEXT_TURN', playerId: 'p2' });
    const opponentCreature = game
      .getPlayerView('p2')
      .game.player.hand.find((card) => card.cardId === 'ancient_scholar')!;
    playCard(game, 'p2', opponentCreature.instanceId, targetLandIndex);
    game.command({ type: 'NEXT_TURN', playerId: 'p2' });

    completeBattles(game, 4, targetLandIndex);

    const view = game.getPlayerView('p1');

    expect(view.game.enemy.lands[targetLandIndex].creature).toBeUndefined();
  });

  it('a creature that dies moves to the graveyard', () => {
    const targetLandIndex = 0;
    const game = createTestGame({ shuffleDeck: false });

    game.command({ type: 'NEXT_TURN', playerId: 'p1' });
    const playerCreature = game
      .getPlayerView('p1')
      .game.player.hand.find((card) => card.cardId === 'big_foot')!;
    playCard(game, 'p1', playerCreature.instanceId, targetLandIndex);
    game.command({ type: 'NEXT_TURN', playerId: 'p1' });

    game.command({ type: 'NEXT_TURN', playerId: 'p2' });
    const opponentCreature = game
      .getPlayerView('p2')
      .game.player.hand.find((card) => card.cardId == 'ancient_scholar')!;
    playCard(game, 'p2', opponentCreature.instanceId, targetLandIndex);
    game.command({ type: 'NEXT_TURN', playerId: 'p2' });

    completeBattles(game, 4, targetLandIndex);

    const view = game.getPlayerView('p1');

    expect(
      view.game.player.graveyard.some(
        (card) => card.instanceId === playerCreature.instanceId,
      ),
    ).toBe(true);
  });

  it('both creatures can die at the same time', () => {
    const targetLandIndex = 0;
    const game = createTestGameWithCardsInHand(
      'archer_dan',
      'uni_knight',
    );

    game.command({ type: 'NEXT_TURN', playerId: 'p1' });
    const playerCreature = game.getPlayerView('p1').game.player.hand[0]!;
    playCard(game, 'p1', playerCreature.instanceId, targetLandIndex);
    game.command({ type: 'NEXT_TURN', playerId: 'p1' });

    game.command({ type: 'NEXT_TURN', playerId: 'p2' });
    const opponentCreature = game.getPlayerView('p2').game.player.hand[0]!;
    playCard(game, 'p2', opponentCreature.instanceId, targetLandIndex);
    game.command({ type: 'NEXT_TURN', playerId: 'p2' });

    completeBattles(game, 2, targetLandIndex);

    const view = game.getPlayerView('p1');

    expect([
      view.game.player.lands[targetLandIndex].creature,
      view.game.enemy.lands[targetLandIndex].creature,
    ]).toEqual([undefined, undefined]);
  });
});
