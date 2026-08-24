import {Server} from 'http';
import supertest from 'supertest';
import type {LoginRequest, SignupRequest} from '../src/auth';

function randomString(length = 8): string {
  return Math.random()
    .toString(36)
    .slice(2, 2 + length);
}

export function signup(server: Server, request: SignupRequest): supertest.Test {
  return supertest(server)
    .post('/api/v0/auth/signup')
    .send(request);
}

export function login(server: Server, request: LoginRequest): supertest.Test {
  return supertest(server)
    .post('/api/v0/auth/login')
    .send(request);
}

export async function signupRandomUser(server: Server): Promise<string> {
  const random = randomString();

  const response = await signup(server, {
    username: `user-${random}`,
    email: `user-${random}@example.com`,
    password: 'password',
  });

  return response.headers['set-cookie'][0];
}

export function createLobby(server: Server, authCookie: string): supertest.Test {
  return supertest(server)
    .post('/api/v0/lobby')
    .set('Cookie', authCookie);
}

export function joinLobby(
  server: Server,
  lobbyId: string,
  authCookie: string,
): supertest.Test {
  return supertest(server)
    .post(`/api/v0/lobby/${lobbyId}/join`)
    .set('Cookie', authCookie);
}
