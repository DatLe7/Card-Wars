import {afterEach, beforeAll, describe, expect, it} from 'vitest';
import {server} from './setup';
import {login, signup} from './testutils';

const configuredSecret = process.env.SECRET;

afterEach(() => {
  process.env.SECRET = configuredSecret;
});

describe('Auth Signup', () => {
  it('return code', async () => {
    const res = await signup(server, {
      username: 'dat', 
      email: 'dat@gmail.com', 
      password: 'password'
    });
    expect(res.status).toBe(201)
  })
  it('returns auth token', async () => {
    await signup(server, {
      username: 'cookie-test',
      email: 'cookie-test@gmail.com',
      password: 'password'
    })
      .expect('Set-Cookie', /authToken=/)
  })
  it('cannot signup with a used email', async () => {
    await signup(server, {
      username: 'dat', 
      email: 'dat@gmail.com', 
      password: 'password'
    });
    const res = await signup(server, {
      username: 'dat', 
      email: 'dat@gmail.com', 
      password: 'password'
    });
    expect(res.status).toBe(409)
  })
  it('cannot signup with invalid email', async () => {
    const res = await signup(server, {
      username: 'dat', 
      email: 'com', 
      password: 'password'
    });
    expect(res.status).toBe(400)
  })
})

describe('Auth Login', () => {
  beforeAll(async () => {
    await signup(server, {
      username: 'dat', 
      email: 'dat@gmail.com', 
      password: 'password'
    });
  })
  it('return code', async () => {
    const res = await login(server, {
      email: 'dat@gmail.com', 
      password: 'password'
    })
    expect(res.status).toBe(200)
  })
  it('returns auth token', async () => {
    await login(server, {
      email: 'dat@gmail.com',
      password: 'password'
    })
      .expect('Set-Cookie', /authToken=/)
  })
  it('cannot login with invalid email', async () => {
    const res = await login(server, {
      email: 'com', 
      password: 'password'
    });
    expect(res.status).toBe(400)
  })
  it('cannot login to fake user', async () => {
    const res = await login(server, {
      email: 'fake@fakes.com', 
      password: 'password'
    });
    expect(res.status).toBe(401)
  })
  it('cannot login with wrong password', async () => {
    const res = await login(server, {
      email: 'dat@gmail.com', 
      password: 'fakepass'
    })
    expect(res.status).toBe(401)
  })
})
