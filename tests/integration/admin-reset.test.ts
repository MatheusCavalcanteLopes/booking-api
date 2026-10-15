import request from 'supertest';
import { buildApp } from '../../src/app';
import { prisma } from '../../src/config/prisma';
import { generateAccessToken } from '../../src/shared/utils/jwt';
import { hashPassword } from '../../src/shared/utils/password';
import { SAMPLE_RESOURCES } from '../../src/shared/sampleResources';

const app = buildApp();

/**
 * The admin reset endpoints are destructive for every account on the demo,
 * not just the caller's — so the critical property to verify is that a
 * "Try as Admin" preview (role:'ADMIN' in the JWT, but previewRole set on
 * the DB row) is rejected just like a regular user would be, even though
 * authorize('ADMIN') alone can't tell a preview apart from a real admin.
 */
describe('Admin reset endpoints', () => {
  let adminId: string;
  let adminToken: string;
  let previewAdminId: string;
  let previewAdminToken: string;
  let resourceId: string;

  beforeAll(async () => {
    const admin = await prisma.user.create({
      data: {
        name: 'Real Admin',
        email: `realadmin.${Date.now()}@example.com`,
        passwordHash: await hashPassword('RealAdminPass123'),
        role: 'ADMIN',
      },
    });
    adminId = admin.id;
    adminToken = generateAccessToken({ sub: admin.id, role: 'ADMIN' });

    const previewAdmin = await prisma.user.create({
      data: {
        name: 'Preview Admin',
        email: `previewadmin.${Date.now()}@example.com`,
        passwordHash: await hashPassword('PreviewAdminPass123'),
        role: 'ADMIN', // mirrors what setAdminPreview actually writes
        previewRole: 'USER', // ...the field that reveals it's not genuine
      },
    });
    previewAdminId = previewAdmin.id;
    previewAdminToken = generateAccessToken({ sub: previewAdmin.id, role: 'ADMIN' });
  });

  afterAll(async () => {
    await prisma.booking.deleteMany({ where: { userId: { in: [adminId, previewAdminId] } } });
    await prisma.resource.deleteMany({});
    await prisma.user.deleteMany({ where: { id: { in: [adminId, previewAdminId] } } });
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.booking.deleteMany({});
    await prisma.resource.deleteMany({});
    const resource = await prisma.resource.create({
      data: { name: `Test Room ${Date.now()}`, capacity: 2 },
    });
    resourceId = resource.id;
  });

  it('rejects all three actions for a preview admin, leaving data untouched', async () => {
    await prisma.booking.create({
      data: {
        userId: previewAdminId,
        resourceId,
        startTime: new Date(Date.now() + 60 * 60 * 1000),
        endTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
        status: 'CONFIRMED',
      },
    });

    for (const path of ['/admin/reset/resources', '/admin/reset/my-bookings', '/admin/reset/all']) {
      const res = await request(app)
        .post(path)
        .set('Authorization', `Bearer ${previewAdminToken}`);
      expect(res.status).toBe(403);
    }

    expect(await prisma.resource.count()).toBe(1);
    expect(await prisma.booking.count({ where: { userId: previewAdminId } })).toBe(1);
  });

  it('resets resources (and cascades bookings) for a genuine admin', async () => {
    await prisma.booking.create({
      data: {
        userId: adminId,
        resourceId,
        startTime: new Date(Date.now() + 60 * 60 * 1000),
        endTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
        status: 'CONFIRMED',
      },
    });

    const res = await request(app)
      .post('/admin/reset/resources')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(204);

    const resources = await prisma.resource.findMany();
    expect(resources).toHaveLength(SAMPLE_RESOURCES.length);
    expect(resources.map((r) => r.name).sort()).toEqual(
      SAMPLE_RESOURCES.map((r) => r.name).sort()
    );
    // The cascade from deleting the old resource should have taken the
    // booking on it down too.
    expect(await prisma.booking.count()).toBe(0);
  });

  it("clears only the caller's own bookings, leaving resources and other users' bookings alone", async () => {
    const otherUser = await prisma.user.create({
      data: {
        name: 'Other User',
        email: `other.${Date.now()}@example.com`,
        passwordHash: await hashPassword('OtherPass123'),
      },
    });

    await prisma.booking.createMany({
      data: [
        {
          userId: adminId,
          resourceId,
          startTime: new Date(Date.now() + 60 * 60 * 1000),
          endTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
          status: 'CONFIRMED',
        },
        {
          userId: otherUser.id,
          resourceId,
          startTime: new Date(Date.now() + 3 * 60 * 60 * 1000),
          endTime: new Date(Date.now() + 4 * 60 * 60 * 1000),
          status: 'CONFIRMED',
        },
      ],
    });

    const res = await request(app)
      .post('/admin/reset/my-bookings')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(204);
    expect(await prisma.booking.count({ where: { userId: adminId } })).toBe(0);
    expect(await prisma.booking.count({ where: { userId: otherUser.id } })).toBe(1);
    expect(await prisma.resource.count()).toBe(1);

    await prisma.booking.deleteMany({ where: { userId: otherUser.id } });
    await prisma.user.delete({ where: { id: otherUser.id } });
  });

  it('reset/all clears resources (with cascaded bookings) and re-seeds the baseline', async () => {
    await prisma.booking.create({
      data: {
        userId: adminId,
        resourceId,
        startTime: new Date(Date.now() + 60 * 60 * 1000),
        endTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
        status: 'CONFIRMED',
      },
    });

    const res = await request(app)
      .post('/admin/reset/all')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(204);
    expect(await prisma.resource.count()).toBe(SAMPLE_RESOURCES.length);
    expect(await prisma.booking.count()).toBe(0);
  });

  it('rejects an unauthenticated request', async () => {
    const res = await request(app).post('/admin/reset/resources');
    expect(res.status).toBe(401);
  });
});
