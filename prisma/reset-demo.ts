import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Runs daily (see .github/workflows/reset-demo.yml) against the live demo
// deployment. The resource-booking conflict check is intentionally
// shared across every visitor (that's the whole point of the feature —
// nobody can double-book the same room, no matter who booked it first),
// so without a periodic reset, test data from one visitor eventually
// clutters the resource list and blocks time slots for the next one.
//
// Scope is deliberately narrow: wipe bookings and any non-seed resources,
// but leave user accounts alone — someone who registered today should
// still be able to log back in tomorrow, they'll just see a clean
// resource list with no bookings of their own.
async function main() {
  const { count: deletedBookings } = await prisma.booking.deleteMany({});
  const { count: deletedResources } = await prisma.resource.deleteMany({});
  console.log(`Cleared ${deletedBookings} booking(s) and ${deletedResources} resource(s)`);

  await prisma.resource.createMany({
    data: [
      {
        name: 'Conference Room A',
        description: 'Projector, whiteboard, seats 8',
        capacity: 8,
        location: '2nd floor',
      },
      {
        name: 'Conference Room B',
        description: 'Video conferencing setup',
        capacity: 4,
        location: '2nd floor',
      },
      {
        name: 'Portable Projector',
        description: 'HDMI + wireless casting',
        capacity: 1,
        location: 'Equipment room',
      },
    ],
  });
  console.log('Re-seeded 3 sample resources');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
