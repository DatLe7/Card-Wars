import {describe, it, expect} from 'vitest';
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