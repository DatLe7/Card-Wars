import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Socket } from 'socket.io-client';

import type { PlayerView } from '../../../engine/src/views';
import { createLobby, joinLobby, signupRandomUser } from '../testutils';
import { server, socketUrl } from '../setup';
import { connectSocket } from './testutils';

describe('Game Start', () => {
  let lobbyId: string;
  let ownerSocket: Socket;
  let playerSocket: Socket;

  async function startGame(): Promise<[PlayerView, PlayerView]> {
    const ownerView = new Promise<PlayerView>((resolve) => {
      ownerSocket.once('game:state', resolve);
    });
    const playerView = new Promise<PlayerView>((resolve) => {
      playerSocket.once('game:state', resolve);
    });

    await ownerSocket.timeout(1000).emitWithAck('lobby:start', { lobbyId });

    return Promise.all([ownerView, playerView]);
  }

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
      views = await startGame();
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
      for (const view of views) {
        for (const lands of [view.game.player.lands, view.game.enemy.lands]) {
          expect(lands).toHaveLength(4);
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
  it('emitting actions to a non started lobby does nothing', async () => {
    const ownerView = vi.fn();
    const playerView = vi.fn();
    ownerSocket.on('game:state', ownerView);
    playerSocket.on('game:state', playerView);

    try {
      for (const socket of [ownerSocket, playerSocket]) {
        socket.emit('game:action', {
          gameId: lobbyId,
          action: { type: 'NEXT_TURN' },
        });
      }

      await new Promise<void>((resolve) => setTimeout(resolve, 100));

      expect(ownerView).not.toHaveBeenCalled();
      expect(playerView).not.toHaveBeenCalled();
    } finally {
      ownerSocket.off('game:state', ownerView);
      playerSocket.off('game:state', playerView);
    }
  });

  describe('actions', () => {
    let views: [PlayerView, PlayerView];

    beforeEach(async () => {
      views = await startGame();
    });

    it('emitting a valid action changes game state', async () => {
      const activePlayerId = views[0].turn.activePlayerId;
      const activeSocket = views[0].id === activePlayerId ? ownerSocket : playerSocket;
      const ownerView = new Promise<PlayerView>((resolve) => {
        ownerSocket.once('game:state', resolve);
      });
      const playerView = new Promise<PlayerView>((resolve) => {
        playerSocket.once('game:state', resolve);
      });

      activeSocket.emit('game:action', {
        gameId: lobbyId,
        action: { type: 'NEXT_TURN', playerId: activePlayerId },
      });

      const updatedViews = await Promise.all([ownerView, playerView]);

      expect(updatedViews[0]).not.toEqual(views[0]);
      expect(updatedViews[1]).not.toEqual(views[1]);
    });

    it('emitting an invalid action does not send a new game state', async () => {
      const activePlayerId = views[0].turn.activePlayerId;
      const inactiveIndex = views[0].id === activePlayerId ? 1 : 0;
      const inactiveSocket = inactiveIndex === 0 ? ownerSocket : playerSocket;
      const ownerView = vi.fn();
      const playerView = vi.fn();
      ownerSocket.on('game:state', ownerView);
      playerSocket.on('game:state', playerView);

      try {
        inactiveSocket.emit('game:action', {
          gameId: lobbyId,
          action: { type: 'NEXT_TURN', playerId: views[inactiveIndex].id },
        });

        await new Promise<void>((resolve) => setTimeout(resolve, 100));

        expect(ownerView).not.toHaveBeenCalled();
        expect(playerView).not.toHaveBeenCalled();
      } finally {
        ownerSocket.off('game:state', ownerView);
        playerSocket.off('game:state', playerView);
      }
    });

    it('emitting an action to a fake lobby does nothing', async () => {
      const activePlayerId = views[0].turn.activePlayerId;
      const activeSocket = views[0].id === activePlayerId ? ownerSocket : playerSocket;
      const ownerView = vi.fn();
      const playerView = vi.fn();
      ownerSocket.on('game:state', ownerView);
      playerSocket.on('game:state', playerView);

      try {
        activeSocket.emit('game:action', {
          gameId: 'fake-lobby',
          action: { type: 'NEXT_TURN', playerId: activePlayerId },
        });

        await new Promise<void>((resolve) => setTimeout(resolve, 100));

        expect(ownerView).not.toHaveBeenCalled();
        expect(playerView).not.toHaveBeenCalled();
      } finally {
        ownerSocket.off('game:state', ownerView);
        playerSocket.off('game:state', playerView);
      }
    });
  });
});
