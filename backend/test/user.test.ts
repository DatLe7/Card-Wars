import {describe, it, expect, beforeAll} from 'vitest';
import supertest from 'supertest';
import {server} from './setup';

describe("User Signup", () => {
  it('return code', async () => {
    const res = await supertest(server)
      .post('/api/v0/user/signup')
      .send({ 
        username: 'dat', 
        email: 'dat@gmail.com', 
        password: 'password'
      });
    expect(res.status).toBe(201)
  })
  it('returns auth token', async () => {
    await supertest(server)
      .post('/api/v0/user/signup')
      .send({ 
        username: 'cookie-test',
        email: 'cookie-test@gmail.com',
        password: 'password'
      })
      .expect('Set-Cookie', /authToken=/)
  })
  it('cannot signup with a used email', async () => {
    await supertest(server)
      .post('/api/v0/user/signup')
      .send({ 
        username: 'dat', 
        email: 'dat@gmail.com', 
        password: 'password'
      });
    const res = await supertest(server)
      .post('/api/v0/user/signup')
      .send({ 
        username: 'dat', 
        email: 'dat@gmail.com', 
        password: 'password'
      });
    expect(res.status).toBe(409)
  })
  it('cannot signup with invalid email', async () => {
    const res = await supertest(server)
      .post('/api/v0/user/signup')
      .send({ 
        username: 'dat', 
        email: 'com', 
        password: 'password'
      });
    expect(res.status).toBe(400)
  })
})

describe('User Login', () => {
  beforeAll(async () => {
    await supertest(server)
      .post('/api/v0/user/signup')
      .send({ 
        username: 'dat', 
        email: 'dat@gmail.com', 
        password: 'password'
      });
  })
  it('return code', async () => {
    const res = await supertest(server)
      .post('/api/v0/user/login')
      .send({
        email: 'dat@gmail.com', 
        password: 'password'
      })
    expect(res.status).toBe(200)
  })
  it('returns auth token', async () => {
    await supertest(server)
      .post('/api/v0/user/login')
      .send({ 
        email: 'dat@gmail.com',
        password: 'password'
      })
      .expect('Set-Cookie', /authToken=/)
  })
  it('cannot login with invalid email', async () => {
    const res = await supertest(server)
      .post('/api/v0/user/login')
      .send({ 
        email: 'com', 
        password: 'password'
      });
    expect(res.status).toBe(400)
  })
  it('cannot login to fake user', async () => {
    const res = await supertest(server)
      .post('/api/v0/user/login')
      .send({ 
        email: 'fake@fakes.com', 
        password: 'password'
      });
    expect(res.status).toBe(401)
  })
  it('cannot login with wrong password', async () => {
    const res = await supertest(server)
      .post('/api/v0/user/login')
      .send({
        email: 'dat@gmail.com', 
        password: 'fakepass'
      })
    expect(res.status).toBe(401)
  })
})