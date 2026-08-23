import {Server} from 'http';
import supertest from 'supertest';
import type {LoginRequest, SignupRequest} from '../src/auth';

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
