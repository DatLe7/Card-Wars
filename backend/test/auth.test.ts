import {afterEach, beforeAll, describe, expect, it} from 'vitest';
import jwt from 'jsonwebtoken';
import supertest from 'supertest';
import {server} from './setup';
import {login, signup} from './testutils';
import {verifyJwt} from '../src/auth/service';
import {HttpError} from '../src/errors/httperror';

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
      username: 'dat1',
      email: 'datDupe@gmail.com',
      password: 'password'
    });
    const res = await signup(server, {
      username: 'dat3',
      email: 'datDupe@gmail.com',
      password: 'password'
    });
    expect(res.status).toBe(409)
  })
  it('cannot signup with invalid email', async () => {
    const res = await signup(server, {
      username: 'dat1',
      email: 'com',
      password: 'password'
    });
    expect(res.status).toBe(400)
  })
  it('cannot signup using a invalid username', async () => {
    const res = await signup(server, {
      username: '',
      email: 'invalid-username@gmail.com',
      password: 'password'
    });
    expect(res.status).toBe(400)
  })
  it('cannot signup using a used username', async () => {
    await signup(server, {
      username: 'usernameDupe',
      email: 'usernameDupe1@gmail.com',
      password: 'password'
    });
    const res = await signup(server, {
      username: 'usernameDupe',
      email: 'usernameDupe2@gmail.com',
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
      identifier: 'dat@gmail.com',
      password: 'password'
    })
    expect(res.status).toBe(200)
  })
  it('returns auth token', async () => {
    await login(server, {
      identifier: 'dat@gmail.com',
      password: 'password'
    })
      .expect('Set-Cookie', /authToken=/)
  })
  it('can login using username', async () => {
    const res = await login(server, {
      identifier: 'dat',
      password: 'password'
    })
    expect(res.status).toBe(200)
  })
  it('cannot login with invalid identifier', async () => {
    const res = await login(server, {
      identifier: '',
      password: 'password'
    });
    expect(res.status).toBe(400)
  })
  it('cannot login to fake user', async () => {
    const res = await login(server, {
      identifier: 'fake@fakes.com',
      password: 'password'
    });
    expect(res.status).toBe(401)
  })
  it('cannot login with wrong password', async () => {
    const res = await login(server, {
      identifier: 'dat@gmail.com',
      password: 'fakepass'
    })
    expect(res.status).toBe(401)
  })
})

describe('Cookie check', () => {
  let authCookie: string;
  let userId: string;

  beforeAll(async () => {
    const res = await signup(server, {
      username: 'cookie-check-user',
      email: 'cookie-check-user@example.com',
      password: 'password'
    }).expect(201);

    authCookie = res.headers['set-cookie'][0].split(';')[0];
    const token = decodeURIComponent(authCookie.slice('authToken='.length));
    userId = verifyJwt(token).id;
  });

  it('returns 200 for a valid auth cookie', async () => {
    const res = await supertest(server)
      .get('/api/v0/auth/me')
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);
  });

  it('returns the user for a valid auth cookie', async () => {
    const res = await supertest(server)
      .get('/api/v0/auth/me')
      .set('Cookie', authCookie);

    expect(res.body).toEqual({ id: userId, name: 'cookie-check-user' });
  });

  it('returns 401 when the auth cookie is missing', async () => {
    const res = await supertest(server).get('/api/v0/auth/me');

    expect(res.status).toBe(401);
  });

  it('returns 401 when the auth cookie is malformed', async () => {
    const res = await supertest(server)
      .get('/api/v0/auth/me')
      .set('Cookie', 'authToken=not-a-jwt');

    expect(res.status).toBe(401);
  });

  it('returns 401 when the token has expired', async () => {
    const token = jwt.sign({ id: userId }, process.env.SECRET as string, {
      algorithm: 'HS256',
      expiresIn: -60,
    });
    const res = await supertest(server)
      .get('/api/v0/auth/me')
      .set('Cookie', `authToken=${token}`);

    expect(res.status).toBe(401);
  });

  it('returns 401 when the token has an invalid signature', async () => {
    const token = jwt.sign({ id: userId }, `${process.env.SECRET}-wrong-key`, {
      algorithm: 'HS256',
      expiresIn: '30m',
    });
    const res = await supertest(server)
      .get('/api/v0/auth/me')
      .set('Cookie', `authToken=${token}`);

    expect(res.status).toBe(401);
  });
})

// logout

describe('JWT verification', () => {
  it('rejects a JWT with the wrong payload structure', () => {
    const token = jwt.sign(
      { userId: '00000000-0000-0000-0000-000000000000' },
      process.env.SECRET as string,
      { algorithm: 'HS256' },
    );

    try {
      verifyJwt(token);
      throw new Error('Expected verifyJwt to throw');
    } catch (error) {
      expect((error as HttpError).status).toBe(401);
    }
  });
});
