import request from 'supertest';
import { buildApp } from '../../src/app';
import { prisma } from '../../src/config/prisma';
import { generateAccessToken } from '../../src/shared/utils/jwt';
import { hashPassword } from '../../src/shared/utils/password';

const app = buildApp();

describe('PATCH /users/me', () => {
  let token: string;
  let userId: string;

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        name: 'Locale Test User',
        email: `locale.${Date.now()}@example.com`,
        passwordHash: await hashPassword('LocalePass123'),
      },
    });
    userId = user.id;
    token = generateAccessToken({ sub: user.id, role: user.role });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { id: userId } });
    await prisma.$disconnect();
  });

  it('updates the current user locale', async () => {
    const res = await request(app)
      .patch('/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ locale: 'en' });

    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ id: userId, locale: 'en' });

    const stored = await prisma.user.findUnique({ where: { id: userId } });
    expect(stored?.locale).toBe('en');
  });

  it('rejects an unsupported locale value', async () => {
    const res = await request(app)
      .patch('/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ locale: 'fr' });

    expect(res.status).toBe(422);
  });

  it('rejects the request when unauthenticated', async () => {
    const res = await request(app).patch('/users/me').send({ locale: 'en' });

    expect(res.status).toBe(401);
  });
});
