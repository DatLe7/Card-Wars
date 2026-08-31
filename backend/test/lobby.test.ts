import {beforeAll, describe, expect, it} from 'vitest';
import supertest from 'supertest';
import {server} from './setup';
import {createLobby, joinLobby, signup, signupRandomUser} from './testutils';
import {createJwt} from '../src/auth/service';

describe('Get Lobby', () => {
  let authCookie: string
  beforeAll(async () => {
    const response = await signup(server, {
      username: 'lobby-user',
      email: 'lobby-user@gmail.com',
      password: 'password',
    });

    authCookie = response.headers['set-cookie'][0];
  })
  it('return code', async () => {
    await supertest(server)
      .get('/api/v0/lobby')
      .set('Cookie', authCookie)
      .expect(200)
  });

  it('rejects a user without an auth cookie', async () => {
    await supertest(server)
      .get('/api/v0/lobby')
      .expect(401);
  });

  it('rejects a user with an invalid auth cookie', async () => {
    await supertest(server)
      .get('/api/v0/lobby')
      .set('Cookie', 'authToken=invalid')
      .expect(401);
  });

  it('rejects a valid token for a user that does not exist', async () => {
    await supertest(server)
      .get('/api/v0/lobby')
      .set('Cookie', `authToken=${createJwt('00000000-0000-0000-0000-000000000000')}`)
      .expect(401);
  });

  it('No lobbies initially', async () => {
    const res = await supertest(server)
      .get('/api/v0/lobby')
      .set('Cookie', authCookie)

    expect(res.body).toStrictEqual([])
  })
});

describe('Create Lobby', () => {
  let res: supertest.Response;
  let authCookie: string;
  let otherAuthCookie: string;

  beforeAll(async () => {
    const signupResponse = await signup(server, {
      username: 'lobby-creator',
      email: 'lobby-creator@gmail.com',
      password: 'password',
    })
    authCookie = signupResponse.headers['set-cookie'][0];

    const otherSignupResponse = await signup(server, {
      username: 'lobby-viewer',
      email: 'lobby-viewer@gmail.com',
      password: 'password',
    })
    otherAuthCookie = otherSignupResponse.headers['set-cookie'][0];

    res = await createLobby(server, authCookie)

  })

  it('return code', () => {
    expect(res.status).toBe(201)
  })

  it('returns name', () => {
    expect(res.body.name).toBe('lobby-creator\'s lobby')
  })

  it('returns lobby id', () => {
    expect(res.body.id).toBeDefined()
  })

  it('returns owner', () => {
    expect(res.body.owner).toBe('lobby-creator')
  })

  it('returns player as null', () => {
    expect(res.body.player).toBeNull()
  })

  it('does not show the created lobby to its owner', async () => {
    const getResponse = await supertest(server)
      .get('/api/v0/lobby')
      .set('Cookie', authCookie)

    expect(getResponse.body).not.toContainEqual(res.body)
  })

  it('shows the created lobby to another user', async () => {
    const getResponse = await supertest(server)
      .get('/api/v0/lobby')
      .set('Cookie', otherAuthCookie)

    expect(getResponse.body).toContainEqual(res.body)
  })

  describe('Creating a replacement lobby', () => {
    let oldLobby: supertest.Response;
    let newLobby: supertest.Response;
    let lobbyList: supertest.Response;

    beforeAll(async () => {
      const ownerAuthCookie = await signupRandomUser(server);
      oldLobby = await createLobby(server, ownerAuthCookie);
      newLobby = await createLobby(server, ownerAuthCookie);

      const viewerAuthCookie = await signupRandomUser(server);
      lobbyList = await supertest(server)
        .get('/api/v0/lobby')
        .set('Cookie', viewerAuthCookie);
    });

    it('deletes the old lobby', () => {
      expect(lobbyList.body).not.toContainEqual(
        expect.objectContaining({ id: oldLobby.body.id }),
      );
    });

    it('creates the new lobby', () => {
      expect(lobbyList.body).toContainEqual(
        expect.objectContaining({ id: newLobby.body.id }),
      );
    });
  });
})

describe('Join Lobby', () => {
  let res: supertest.Response;

  beforeAll(async () => {
    const signupResponse = await signup(server, {
      username: 'join-lobby-creator',
      email: 'join-lobby-creator@gmail.com',
      password: 'password',
    })
    const creatorAuthCookie = signupResponse.headers['set-cookie'][0];

    const createResponse = await createLobby(server, creatorAuthCookie)

    const lobbyCode = createResponse.body.id;

    const otherSignupResponse = await signup(server, {
      username: 'lobby-joiner',
      email: 'lobby-joiner@gmail.com',
      password: 'password',
    })
    const authCookie = otherSignupResponse.headers['set-cookie'][0];

    res = await joinLobby(server, lobbyCode, authCookie);
  })

  it('return code', async () => {
    expect(res.status).toBe(200)
  })

  it('returns name', () => {
    expect(res.body.name).toBe('join-lobby-creator\'s lobby')
  })

  it('returns lobby id', () => {
    expect(res.body.id).toBeDefined()
  })

  it('returns owner', () => {
    expect(res.body.owner).toBe('join-lobby-creator')
  })

  it('returns player', () => {
    expect(res.body.player).toBe('lobby-joiner')
  })

  it('cannot join own lobby', async () => {
    const ownerAuthCookie = await signupRandomUser(server)
    const createResponse = await createLobby(server, ownerAuthCookie);
    const lobbyId = createResponse.body.id;
    const joinResponse = await joinLobby(server, lobbyId, ownerAuthCookie);

    expect(joinResponse.status).toBe(404);
  })

  it('cannot join a full lobby', async () => {
    const ownerAuthCookie = await signupRandomUser(server)
    const createResponse = await createLobby(server, ownerAuthCookie);
    const lobbyId = createResponse.body.id;
    const firstPlayerCookie = await signupRandomUser(server)
    await joinLobby(server, lobbyId, firstPlayerCookie);
    const secondPlayerCookie = await signupRandomUser(server)
    const joinResponse = await joinLobby(server, lobbyId, secondPlayerCookie);

    expect(joinResponse.status).toBe(404);
  })

  it('cant join fake lobby', async () => {
    const playerCookie = await signupRandomUser(server)
    const res = await joinLobby(
      server,
      '00000000-0000-0000-0000-000000000000',
      playerCookie,
    )

    expect(res.status).toBe(404)
  })
  it('cannot join a lobby while already in another lobby', async () => {
    const firstOwnerCookie = await signupRandomUser(server);
    const firstLobby = await createLobby(server, firstOwnerCookie);
    const playerCookie = await signupRandomUser(server);
    await joinLobby(server, firstLobby.body.id, playerCookie);

    const secondOwnerCookie = await signupRandomUser(server);
    const secondLobby = await createLobby(server, secondOwnerCookie);
    const joinResponse = await joinLobby(
      server,
      secondLobby.body.id,
      playerCookie,
    );

    expect(joinResponse.status).toBe(409);
  })

  it('cannot join a lobby while owning another lobby', async () => {
    const playerCookie = await signupRandomUser(server);
    await createLobby(server, playerCookie);

    const targetOwnerCookie = await signupRandomUser(server);
    const targetLobby = await createLobby(server, targetOwnerCookie);
    const joinResponse = await joinLobby(
      server,
      targetLobby.body.id,
      playerCookie,
    );

    expect(joinResponse.status).toBe(409);
  })
})
