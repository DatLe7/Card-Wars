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
});
