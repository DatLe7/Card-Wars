import { describe, expect, it } from 'vitest';

import { createLobby, joinLobby, signupRandomUser } from '../testutils';
import { server, socketUrl } from '../setup';
import { connectSocket } from './testutils';

describe('Lobby', () => {
  it('Joining a lobby returns lobby name', async () => {
    const ownerAuthCookie = await signupRandomUser(server);
    const createResponse = await createLobby(server, ownerAuthCookie);
    const socket = await connectSocket(socketUrl, ownerAuthCookie);

    const res = await socket.timeout(1000).emitWithAck('lobby:join', {
      lobbyId: createResponse.body.id,
    });

    expect(res.name).toBe(createResponse.body.name);
    socket.disconnect();
  });
  it('Joining a fake lobby throws errors', async () => {
    const ownerAuthCookie = await signupRandomUser(server);
    const socket = await connectSocket(socketUrl, ownerAuthCookie);

    const res = await socket.timeout(1000).emitWithAck('lobby:join', {
      lobbyId: '00000000-0000-0000-0000-000000000000',
    });

    expect(res.status).toBe(404);
    socket.disconnect();
  })
  it('Must use valid id for lobby', async () => {
    const ownerAuthCookie = await signupRandomUser(server);
    const socket = await connectSocket(socketUrl, ownerAuthCookie);

    const res = await socket.timeout(1000).emitWithAck('lobby:join', {
      lobbyId: 'invalid-id',
    });

    expect(res.status).toBe(500);
    socket.disconnect();
  })
  it('Can Join Someone elses Lobby', async () => {
    const ownerAuthCookie = await signupRandomUser(server);
    const joinerAuthCookie = await signupRandomUser(server);
    const createResponse = await createLobby(server, ownerAuthCookie);
    const joinResponse = await joinLobby(server, createResponse.body.id, joinerAuthCookie)
    const ownerSocket = await connectSocket(socketUrl, ownerAuthCookie);
    const joinerSocket = await connectSocket(socketUrl, joinerAuthCookie);

    await ownerSocket.timeout(1000).emitWithAck('lobby:join', {
      lobbyId: createResponse.body.id,
    });

    const res = await joinerSocket.timeout(1000).emitWithAck('lobby:join', {
      lobbyId: joinResponse.body.id,
    });

    expect(res.player).toBeDefined();
    ownerSocket.disconnect();
    joinerSocket.disconnect();
  })
  it('Joining a lobby returns lobby id', async () => {
    const ownerAuthCookie = await signupRandomUser(server);
    const createResponse = await createLobby(server, ownerAuthCookie);
    const socket = await connectSocket(socketUrl, ownerAuthCookie);

    const res = await socket.timeout(1000).emitWithAck('lobby:join', {
      lobbyId: createResponse.body.id,
    });

    expect(res.id).toBe(createResponse.body.id);
    socket.disconnect();
  });

  it('Joining a new lobby returns no player', async () => {
    const ownerAuthCookie = await signupRandomUser(server);
    const createResponse = await createLobby(server, ownerAuthCookie);
    const socket = await connectSocket(socketUrl, ownerAuthCookie);

    const res = await socket.timeout(1000).emitWithAck('lobby:join', {
      lobbyId: createResponse.body.id,
    });

    expect(res.player).toBeNull();
    socket.disconnect();
  });

  it('Joining a lobby returns its owner', async () => {
    const ownerAuthCookie = await signupRandomUser(server);
    const createResponse = await createLobby(server, ownerAuthCookie);
    const socket = await connectSocket(socketUrl, ownerAuthCookie);

    const res = await socket.timeout(1000).emitWithAck('lobby:join', {
      lobbyId: createResponse.body.id,
    });

    expect(res.owner).toBe(createResponse.body.owner);
    socket.disconnect();
  });
});
