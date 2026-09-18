import request from 'supertest';
import { buildApp } from '../../src/app';
import { prisma } from '../../src/config/prisma';
import { generateAccessToken } from '../../src/shared/utils/jwt';
import { hashPassword } from '../../src/shared/utils/password';

const app = buildApp();

describe('DELETE /bookings/trash', () => {
  let token: string;
  let userId: string;
  let resourceId: string;

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        name: 'Trash Test User',
        email: `trash.${Date.now()}@example.com`,
        passwordHash: await hashPassword('TrashPass123'),
      },
    });
    userId = user.id;
    token = generateAccessToken({ sub: user.id, role: user.role });

    const resource = await prisma.resource.create({
      data: { name: `Trash Test Room ${Date.now()}`, capacity: 2 },
    });
    resourceId = resource.id;
  });

  afterAll(async () => {
    await prisma.booking.deleteMany({ where: { userId } });
    await prisma.resource.deleteMany({ where: { id: resourceId } });
    await prisma.user.deleteMany({ where: { id: userId } });
    await prisma.$disconnect();
  });

  it("deletes the user's cancelled bookings but leaves confirmed ones untouched", async () => {
    const cancelled = await prisma.booking.create({
      data: {
        userId,
        resourceId,
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 25 * 60 * 60 * 1000),
        status: 'CANCELLED',
      },
    });
    const confirmed = await prisma.booking.create({
      data: {
        userId,
        resourceId,
        startTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 49 * 60 * 60 * 1000),
        status: 'CONFIRMED',
      },
    });

    const res = await request(app)
      .delete('/bookings/trash')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(204);

    const cancelledAfter = await prisma.booking.findUnique({ where: { id: cancelled.id } });
    const confirmedAfter = await prisma.booking.findUnique({ where: { id: confirmed.id } });

    expect(cancelledAfter).toBeNull();
    expect(confirmedAfter).not.toBeNull();
  });

  it('rejects the request when unauthenticated', async () => {
    const res = await request(app).delete('/bookings/trash');
    expect(res.status).toBe(401);
  });
});
