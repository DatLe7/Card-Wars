import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { Socket } from 'socket.io-client';

import type { PlayerView } from '../../../engine/src/views';
import { createLobby, joinLobby, signupRandomUser } from '../testutils';
import { server, socketUrl } from '../setup';
import { connectSocket } from './testutils';

describe('Game Start', () => {
  let lobbyId: string;
  let ownerSocket: Socket;
  let playerSocket: Socket;

  beforeEach(async () => {
    const ownerAuthCookie = await signupRandomUser(server);
    const playerAuthCookie = await signupRandomUser(server);
    const createResponse = await createLobby(server, ownerAuthCookie);
    lobbyId = createResponse.body.id;

    await joinLobby(server, lobbyId, playerAuthCookie);

    ownerSocket = await connectSocket(socketUrl, ownerAuthCookie);
    playerSocket = await connectSocket(socketUrl, playerAuthCookie);

    await ownerSocket.timeout(1000).emitWithAck('lobby:join', {
      lobbyId,
    });
    await playerSocket.timeout(1000).emitWithAck('lobby:join', {
      lobbyId,
    });

    await playerSocket.timeout(1000).emitWithAck('lobby:deck-change', {
      lobbyId,
    });
  });

  afterEach(() => {
    ownerSocket.disconnect();
    playerSocket.disconnect();
  });

  it('emits game state to both players when the owner starts the game', async () => {
    const ownerPlayerView = new Promise<PlayerView>((resolve) => {
      ownerSocket.once('game:state', resolve);
    });
    const playerPlayerView = new Promise<PlayerView>((resolve) => {
      playerSocket.once('game:state', resolve);
    });

    ownerSocket.emit('lobby:start', {
      lobbyId,
    });

    const [ownerView, playerView] = await Promise.all([
      ownerPlayerView,
      playerPlayerView,
    ]);

    expect(ownerView).toBeDefined();
    expect(playerView).toBeDefined();
  });

  it('non-owner cannot start game', async () => {
    const response = await playerSocket
      .timeout(1000)
      .emitWithAck('lobby:start', { lobbyId });

    expect(response).toEqual({
      error: 'Game cannot be started',
      status: 409,
    });
  });

  it('cannot start a lobby that you are not part of', async () => {
    const unrelatedAuthCookie = await signupRandomUser(server);
    const unrelatedSocket = await connectSocket(socketUrl, unrelatedAuthCookie);

    const response = await unrelatedSocket
      .timeout(1000)
      .emitWithAck('lobby:start', { lobbyId });

    expect(response).toEqual({
      error: 'Game cannot be started',
      status: 409,
    });
    unrelatedSocket.disconnect();
  });

  it('cannot start a game that has already started', async () => {
    const ownerGameState = new Promise<PlayerView>((resolve) => {
      ownerSocket.once('game:state', resolve);
    });
    const playerGameState = new Promise<PlayerView>((resolve) => {
      playerSocket.once('game:state', resolve);
    });

    ownerSocket.emit('lobby:start', { lobbyId });
    await Promise.all([ownerGameState, playerGameState]);

    const response = await ownerSocket
      .timeout(1000)
      .emitWithAck('lobby:start', { lobbyId });

    expect(response).toEqual({
      error: 'Game cannot be started',
      status: 409,
    });
  });
  describe('initial game state', () => {
    let views: [PlayerView, PlayerView];

    beforeEach(async () => {
      const ownerView = new Promise<PlayerView>((resolve) => {
        ownerSocket.once('game:state', resolve);
      });
      const playerView = new Promise<PlayerView>((resolve) => {
        playerSocket.once('game:state', resolve);
      });

      await ownerSocket.timeout(1000).emitWithAck('lobby:start', { lobbyId });

      views = await Promise.all([ownerView, playerView]);
    });

    it('shows life for player and enemy', () => {
      for (const view of views) {
        expect(view.game.player.life).toBe(25);
        expect(view.game.enemy.life).toBe(25);
      }
    });

    it('shows action points for player and enemy', () => {
      for (const view of views) {
        expect(view.game.player.actionPoints).toBe(0);
        expect(view.game.enemy.actionPoints).toBe(0);
      }
    });

    it('shows deck count for player and enemy', () => {
      for (const view of views) {
        expect(view.game.player.deckCardCount).toBe(35);
        expect(view.game.enemy.deckCardCount).toBe(35);
      }
    });

    it('shows hand for player', () => {
      for (const view of views) {
        expect(view.game.player.hand).toHaveLength(5);
        for (const card of view.game.player.hand) {
          expect(card).toMatchObject({
            instanceId: expect.any(String),
            ownerId: view.id,
            cardId: expect.any(String),
            name: expect.any(String),
            type: expect.any(String),
            cost: expect.any(Number),
          });
        }
      }
    });

    it('shows handCardCount for enemy', () => {
      for (const view of views) {
        expect(view.game.enemy.handCardCount).toBe(5);
        expect(view.game.enemy).not.toHaveProperty('hand');
      }
    });

    it('shows graveyard for player', () => {
      for (const view of views) {
        expect(view.game.player.graveyard).toEqual([]);
      }
    });

    it('shows graveyardCardCount for enemy', () => {
      for (const view of views) {
        expect(view.game.enemy.graveyardCardCount).toBe(0);
      }
    });

    it('shows lands for both player and enemy', () => {
      for (const [index, view] of views.entries()) {
        const enemyView = views[1 - index];
        expect(view.game.player.lands.map((land) => land.landscape))
          .toEqual(view.decklist.landscape);
        expect(view.game.enemy.lands).toEqual(enemyView.game.player.lands);
        for (const lands of [view.game.player.lands, view.game.enemy.lands]) {
          expect(lands).toHaveLength(4);
          for (const land of lands) {
            expect(land.creature).toBeUndefined();
            expect(land.building).toBeUndefined();
          }
        }
      }
    });

    it('shows actions for turn player', () => {
      const turnPlayer = views.find((view) => view.id === view.turn.activePlayerId);
      if (turnPlayer == undefined) throw new Error('Cant find active player')

      expect(turnPlayer).toHaveProperty('actions', [
        { type: 'NEXT_TURN', playerId: turnPlayer.id },
      ]);
    });

    it('shows no actions for non turn player', () => {
      const nonTurnPlayer = views.find((view) => view.id !== view.turn.activePlayerId);

      expect(nonTurnPlayer).toHaveProperty('actions', []);
    });
  });
});
