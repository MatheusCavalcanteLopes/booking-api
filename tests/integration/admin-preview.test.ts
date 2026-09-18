import request from 'supertest';
import { buildApp } from '../../src/app';
import { prisma } from '../../src/config/prisma';
import { generateAccessToken } from '../../src/shared/utils/jwt';
import { hashPassword } from '../../src/shared/utils/password';

const app = buildApp();

describe('PATCH /users/me/admin-preview', () => {
  let userId: string;
  let userToken: string;
  let adminId: string;
  let adminToken: string;

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        name: 'Preview Test User',
        email: `preview.${Date.now()}@example.com`,
        passwordHash: await hashPassword('PreviewPass123'),
      },
    });
    userId = user.id;
    userToken = generateAccessToken({ sub: user.id, role: user.role });

    const admin = await prisma.user.create({
      data: {
        name: 'Real Admin',
        email: `realadmin.${Date.now()}@example.com`,
        passwordHash: await hashPassword('RealAdminPass123'),
        role: 'ADMIN',
      },
    });
    adminId = admin.id;
    adminToken = generateAccessToken({ sub: admin.id, role: admin.role });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { id: { in: [userId, adminId] } } });
    await prisma.$disconnect();
  });

  it('elevates a regular user to ADMIN, preserving their own account', async () => {
    const res = await request(app)
      .patch('/users/me/admin-preview')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ enabled: true });

    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ id: userId, role: 'ADMIN', previewRole: 'USER' });
    expect(res.body.accessToken).toEqual(expect.any(String));

    const stored = await prisma.user.findUnique({ where: { id: userId } });
    expect(stored?.role).toBe('ADMIN');
    expect(stored?.previewRole).toBe('USER');
  });

  it('restores the original role on disable', async () => {
    const res = await request(app)
      .patch('/users/me/admin-preview')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ enabled: false });

    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ id: userId, role: 'USER', previewRole: null });
  });

  it('rejects disabling when not currently previewing', async () => {
    const res = await request(app)
      .patch('/users/me/admin-preview')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ enabled: false });

    expect(res.status).toBe(403);
  });

  it('rejects enabling for an account that is already a real admin', async () => {
    const res = await request(app)
      .patch('/users/me/admin-preview')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ enabled: true });

    expect(res.status).toBe(403);

    const stored = await prisma.user.findUnique({ where: { id: adminId } });
    expect(stored?.role).toBe('ADMIN');
    expect(stored?.previewRole).toBeNull();
  });

  it('rejects the request when unauthenticated', async () => {
    const res = await request(app).patch('/users/me/admin-preview').send({ enabled: true });
    expect(res.status).toBe(401);
  });
});
