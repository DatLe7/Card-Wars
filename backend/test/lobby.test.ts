import {beforeAll, describe, expect, it} from 'vitest';
import supertest from 'supertest';
import {server} from './setup';
import {signup} from './testutils';
import {createJwt} from '../src/auth/service';

describe('Get Lobby', () => {
  let authCookie: string
  beforeAll(async () => {
    const response = await signup(server, {
      username: 'lobby-user',
      email: 'lobby-user@gmail.com',
      password: 'password',
    }).expect(201);

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

  beforeAll(async () => {
    const signupResponse = await signup(server, {
      username: 'lobby-creator',
      email: 'lobby-creator@gmail.com',
      password: 'password',
    }).expect(201);
    const authCookie = signupResponse.headers['set-cookie'][0];

    res = await supertest(server)
      .post('/api/v0/lobby')
      .set('Cookie', authCookie)
      .expect(201);
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
})
