import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/shared/utils/password';

const prisma = new PrismaClient();

// Gives anyone who clones the repo and runs `docker compose up` (or
// `npx prisma db seed`) a working demo out of the box — an ADMIN account
// to explore the admin UI, and a couple of resources so the app isn't
// an empty screen on first load. Idempotent: safe to run again.
async function main() {
  const adminEmail = 'admin@example.com';
  const adminPasswordHash = await hashPassword('AdminPass123');

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: 'Demo Admin',
      email: adminEmail,
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
    },
  });
  console.log(`Seeded admin user: ${admin.email} (password: AdminPass123)`);

  const resourceCount = await prisma.resource.count();
  if (resourceCount === 0) {
    await prisma.resource.createMany({
      data: [
        { name: 'Conference Room A', description: 'Projector, whiteboard, seats 8', capacity: 8, location: '2nd floor' },
        { name: 'Conference Room B', description: 'Video conferencing setup', capacity: 4, location: '2nd floor' },
        { name: 'Portable Projector', description: 'HDMI + wireless casting', capacity: 1, location: 'Equipment room' },
      ],
    });
    console.log('Seeded 3 sample resources');
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
