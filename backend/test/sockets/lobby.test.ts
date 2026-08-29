import { describe, expect, it } from 'vitest';
import supertest from 'supertest';

import { createLobby, joinLobby, signupRandomUser } from '../testutils';
import { server, socketUrl } from '../setup';
import { connectSocket } from './testutils';

describe('Lobby Join', () => {
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

  it('Joining a lobby updates the owner', async () => {
    const ownerAuthCookie = await signupRandomUser(server);
    const createResponse = await createLobby(server, ownerAuthCookie);
    const ownerSocket = await connectSocket(socketUrl, ownerAuthCookie);

    await ownerSocket.timeout(1000).emitWithAck('lobby:join', {
      lobbyId: createResponse.body.id,
    });

    const playerAuthCookie = await signupRandomUser(server);
    const joinResponse = await joinLobby(
      server,
      createResponse.body.id,
      playerAuthCookie,
    );
    const playerSocket = await connectSocket(socketUrl, playerAuthCookie);
    const ownerUpdate = new Promise<{ player: string | null }>((resolve) => {
      ownerSocket.once('lobby:state', resolve);
    });

    await playerSocket.timeout(1000).emitWithAck('lobby:join', {
      lobbyId: createResponse.body.id,
    });

    const updatedLobby = await ownerUpdate;

    expect(updatedLobby.player).toBe(joinResponse.body.player);
    ownerSocket.disconnect();
    playerSocket.disconnect();
  });
});

describe('Lobby Leave', () => {
  it('Leaving a lobby as the owner deletes the lobby', async () => {
    const ownerAuthCookie = await signupRandomUser(server);
    const createResponse = await createLobby(server, ownerAuthCookie);
    const socket = await connectSocket(socketUrl, ownerAuthCookie);

    await socket.timeout(1000).emitWithAck('lobby:join', {
      lobbyId: createResponse.body.id,
    });

    await socket.timeout(1000).emitWithAck('lobby:leave', {
      lobbyId: createResponse.body.id,
    });

    const otherAuthCookie = await signupRandomUser(server);
    const response = await supertest(server)
      .get('/api/v0/lobby')
      .set('Cookie', otherAuthCookie);

    expect(response.body).not.toContainEqual(
      expect.objectContaining({ id: createResponse.body.id }),
    );
    socket.disconnect();
  });

  it('Cannot leave a lobby the user is not part of', async () => {
    const ownerAuthCookie = await signupRandomUser(server);
    const createResponse = await createLobby(server, ownerAuthCookie);
    const unrelatedAuthCookie = await signupRandomUser(server);
    const socket = await connectSocket(socketUrl, unrelatedAuthCookie);

    const response = await socket.timeout(1000).emitWithAck('lobby:leave', {
      lobbyId: createResponse.body.id,
    });

    expect(response.status).toBe(404);
    socket.disconnect();
  });

  it('Leaving a lobby as the player updates the owner', async () => {
    const ownerAuthCookie = await signupRandomUser(server);
    const createResponse = await createLobby(server, ownerAuthCookie);
    const playerAuthCookie = await signupRandomUser(server);
    await joinLobby(server, createResponse.body.id, playerAuthCookie);

    const ownerSocket = await connectSocket(socketUrl, ownerAuthCookie);
    const playerSocket = await connectSocket(socketUrl, playerAuthCookie);

    await ownerSocket.timeout(1000).emitWithAck('lobby:join', {
      lobbyId: createResponse.body.id,
    });
    await playerSocket.timeout(1000).emitWithAck('lobby:join', {
      lobbyId: createResponse.body.id,
    });

    const ownerUpdate = new Promise<{ player: string | null }>((resolve) => {
      ownerSocket.once('lobby:state', resolve);
    });

    await playerSocket.timeout(1000).emitWithAck('lobby:leave', {
      lobbyId: createResponse.body.id,
    });

    const updatedLobby = await ownerUpdate;

    expect(updatedLobby.player).toBeNull();
    ownerSocket.disconnect();
    playerSocket.disconnect();
  });

  it('Cannot leave a lobby that does not exist', async () => {
    const authCookie = await signupRandomUser(server);
    const socket = await connectSocket(socketUrl, authCookie);

    const response = await socket.timeout(1000).emitWithAck('lobby:leave', {
      lobbyId: '00000000-0000-0000-0000-000000000000',
    });

    expect(response.status).toBe(404);
    socket.disconnect();
  });
});
