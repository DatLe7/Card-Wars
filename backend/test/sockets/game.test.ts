import { describe, expect, it } from 'vitest';

import type { PlayerView } from '../../../engine/src/views';
import { createLobby, joinLobby, signupRandomUser } from '../testutils';
import { server, socketUrl } from '../setup';
import { connectSocket } from './testutils';

describe('Game Start', () => {
  it('emits game state to both players when the owner starts the game', async () => {
    const ownerAuthCookie = await signupRandomUser(server);
    const playerAuthCookie = await signupRandomUser(server);
    const createResponse = await createLobby(server, ownerAuthCookie);
    await joinLobby(server, createResponse.body.id, playerAuthCookie);

    const ownerSocket = await connectSocket(socketUrl, ownerAuthCookie);
    const playerSocket = await connectSocket(socketUrl, playerAuthCookie);

    await ownerSocket.timeout(1000).emitWithAck('lobby:join', {
      lobbyId: createResponse.body.id,
    });
    await playerSocket.timeout(1000).emitWithAck('lobby:join', {
      lobbyId: createResponse.body.id,
    });

    const ownerPlayerView = new Promise<PlayerView>((resolve) => {
      ownerSocket.once('game:state', resolve);
    });
    const playerPlayerView = new Promise<PlayerView>((resolve) => {
      playerSocket.once('game:state', resolve);
    });

    ownerSocket.emit('lobby:start', {
      lobbyId: createResponse.body.id,
    });

    const [ownerView, playerView] = await Promise.all([
      ownerPlayerView,
      playerPlayerView,
    ]);

    expect(ownerView).toBeDefined();
    expect(playerView).toBeDefined();
    ownerSocket.disconnect();
    playerSocket.disconnect();
  });
});
