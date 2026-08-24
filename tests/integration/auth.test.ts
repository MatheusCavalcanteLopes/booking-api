import request from 'supertest';
import { buildApp } from '../../src/app';
import { prisma } from '../../src/config/prisma';

/**
 * These tests hit a real (test) database through Prisma, exercising the
 * full HTTP -> controller -> service -> DB path with supertest — no
 * server actually needs to be listening on a port.
 *
 * Requires DATABASE_URL to point at a disposable test database.
 * Run with: npm test
 */
const app = buildApp();

const testUser = {
  name: 'Ada Lovelace',
  email: `ada.${Date.now()}@example.com`,
  password: 'StrongPass123',
};

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: testUser.email } });
  await prisma.$disconnect();
});

describe('Auth flow', () => {
  it('registers a new user', async () => {
    const res = await request(app).post('/auth/register').send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({
      name: testUser.name,
      email: testUser.email,
      role: 'USER',
    });
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it('rejects registering the same email twice', async () => {
    const res = await request(app).post('/auth/register').send(testUser);
    expect(res.status).toBe(409);
  });

  it('rejects registration with a weak password', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ ...testUser, email: 'someone.else@example.com', password: '123' });

    expect(res.status).toBe(422);
  });

  it('logs in with correct credentials and returns tokens', async () => {
    const res = await request(app).post('/auth/login').send({
      email: testUser.email,
      password: testUser.password,
    });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toEqual(expect.any(String));
    expect(res.body.refreshToken).toEqual(expect.any(String));
  });

  it('rejects login with wrong password', async () => {
    const res = await request(app).post('/auth/login').send({
      email: testUser.email,
      password: 'WrongPassword1',
    });

    expect(res.status).toBe(401);
  });

  it('refreshes tokens with a valid refresh token', async () => {
    const loginRes = await request(app).post('/auth/login').send({
      email: testUser.email,
      password: testUser.password,
    });

    const refreshRes = await request(app)
      .post('/auth/refresh')
      .send({ refreshToken: loginRes.body.refreshToken });

    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body.accessToken).toEqual(expect.any(String));
  });

  it('rejects an obviously invalid refresh token', async () => {
    const res = await request(app)
      .post('/auth/refresh')
      .send({ refreshToken: 'not-a-real-token' });

    expect(res.status).toBe(401);
  });
});
