import { prisma } from '../../config/prisma';
import { ForbiddenError } from '../../shared/errors/AppError';
import { SAMPLE_RESOURCES } from '../../shared/sampleResources';

// A self-service "Try as Admin" preview (see userService#setAdminPreview)
// issues a real JWT with role:'ADMIN' too — authenticate()/authorize()
// can't tell it apart from a genuine admin account, since the claim is
// identical. previewRole being non-null on the DB row is the only
// signal that it's a preview, not a real admin. These reset actions are
// destructive for every account on the demo, not just the caller's, so
// a preview admin — i.e. any visitor who flipped their own USER account
// into preview mode — must not be able to trigger them.
async function assertGenuineAdmin(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== 'ADMIN' || user.previewRole !== null) {
    throw new ForbiddenError('This action requires a genuine admin account, not an admin preview');
  }
}

export const adminService = {
  async resetResources(userId: string) {
    await assertGenuineAdmin(userId);
    // Resources cascade-delete their bookings (see schema.prisma), so this
    // also clears every booking in the system, not just this account's.
    await prisma.resource.deleteMany({});
    await prisma.resource.createMany({ data: SAMPLE_RESOURCES });
  },

  async resetMyBookings(userId: string) {
    await assertGenuineAdmin(userId);
    await prisma.booking.deleteMany({ where: { userId } });
  },

  async resetAll(userId: string) {
    await this.resetResources(userId);
    await this.resetMyBookings(userId);
  },
};
