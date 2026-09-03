import request from 'supertest';
import { buildApp } from '../../src/app';
import { prisma } from '../../src/config/prisma';
import { generateAccessToken } from '../../src/shared/utils/jwt';
import { hashPassword } from '../../src/shared/utils/password';

/**
 * Deactivating a resource is a soft delete meant to preserve booking
 * *history* — but a still-upcoming CONFIRMED booking on a resource that no
 * longer exists is misleading, not history. This covers the fix in
 * resource.service.ts#deactivate: future CONFIRMED bookings get cancelled
 * along with the resource, past ones are left untouched.
 */
const app = buildApp();

describe('Deactivating a resource', () => {
  let adminToken: string;
  let userId: string;
  let resourceId: string;

  beforeAll(async () => {
    const admin = await prisma.user.create({
      data: {
        name: 'Test Admin',
        email: `admin.${Date.now()}@example.com`,
        passwordHash: await hashPassword('AdminPass123'),
        role: 'ADMIN',
      },
    });
    userId = admin.id;
    adminToken = generateAccessToken({ sub: admin.id, role: admin.role });

    const resource = await prisma.resource.create({
      data: { name: `Test Room ${Date.now()}`, capacity: 2 },
    });
    resourceId = resource.id;
  });

  afterAll(async () => {
    await prisma.booking.deleteMany({ where: { resourceId } });
    await prisma.resource.deleteMany({ where: { id: resourceId } });
    await prisma.user.deleteMany({ where: { id: userId } });
    await prisma.$disconnect();
  });

  it('cancels future CONFIRMED bookings but leaves past ones as history', async () => {
    const pastBooking = await prisma.booking.create({
      data: {
        userId,
        resourceId,
        startTime: new Date(Date.now() - 48 * 60 * 60 * 1000),
        endTime: new Date(Date.now() - 47 * 60 * 60 * 1000),
        status: 'CONFIRMED',
      },
    });
    const futureBooking = await prisma.booking.create({
      data: {
        userId,
        resourceId,
        startTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 49 * 60 * 60 * 1000),
        status: 'CONFIRMED',
      },
    });

    const res = await request(app)
      .delete(`/resources/${resourceId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(204);

    const pastAfter = await prisma.booking.findUnique({ where: { id: pastBooking.id } });
    const futureAfter = await prisma.booking.findUnique({ where: { id: futureBooking.id } });

    expect(pastAfter?.status).toBe('CONFIRMED');
    expect(futureAfter?.status).toBe('CANCELLED');

    const resourceAfter = await prisma.resource.findUnique({ where: { id: resourceId } });
    expect(resourceAfter?.isActive).toBe(false);
  });
});
