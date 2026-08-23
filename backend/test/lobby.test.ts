import {describe, expect, it} from 'vitest';
import supertest from 'supertest';
import {server} from './setup';
import {signup} from './testutils';

describe('Lobby', () => {
  it('allows an authenticated user to get the lobby', async () => {
    const signupResponse = await signup(server, {
      username: 'lobby-user',
      email: 'lobby-user@gmail.com',
      password: 'password',
    })
      .expect(201);

    const authCookie = signupResponse.headers['set-cookie'];
    expect(authCookie).toBeDefined();

    await supertest(server)
      .get('/api/v0/lobby')
      .set('Cookie', authCookie)
      .expect(200)
      .expect([]);
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
});
