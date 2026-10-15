import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/shared/utils/password';
import { SAMPLE_RESOURCES } from '../src/shared/sampleResources';

const prisma = new PrismaClient();

// Gives anyone who clones the repo and runs `docker compose up` (or
// `npx prisma db seed`) a working demo out of the box — an ADMIN account
// to explore the admin UI, and a couple of resources so the app isn't
// an empty screen on first load. Idempotent: safe to run again.
//
// This must never run unattended against production — it creates (or
// resets) an admin account with a password that's either a fixed,
// publicly documented default or whatever SEED_ADMIN_PASSWORD holds in
// that environment. NODE_ENV=production requires an explicit opt-in
// (ALLOW_PRODUCTION_SEED=true) so that can't happen by accident.
async function main() {
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_PRODUCTION_SEED !== 'true') {
    console.error(
      'Refusing to seed: NODE_ENV=production without ALLOW_PRODUCTION_SEED=true. ' +
        'This script creates/resets an admin account and is meant for local development only.'
    );
    process.exit(1);
  }

  const adminEmail = 'admin@example.com';
  // Dev-only fallback: only reached when SEED_ADMIN_PASSWORD isn't set,
  // which — given the guard above — means a local/non-production run.
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'AdminPass123';
  const adminPasswordHash = await hashPassword(adminPassword);

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
  console.log(`Seeded admin user: ${admin.email}`);

  const resourceCount = await prisma.resource.count();
  if (resourceCount === 0) {
    await prisma.resource.createMany({ data: SAMPLE_RESOURCES });
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
