import { BookingStatus, Role } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { ConflictError, ForbiddenError, NotFoundError } from '../../shared/errors/AppError';
import { CreateBookingInput } from './booking.schema';
import { canBeCancelled } from './booking.utils';

export const bookingService = {
  async create(userId: string, input: CreateBookingInput) {
    const resource = await prisma.resource.findUnique({
      where: { id: input.resourceId },
    });

    if (!resource || !resource.isActive) {
      throw new NotFoundError('Resource not found or not available');
    }

    // Conflict detection at the database level: instead of loading every
    // booking for this resource and checking overlap in memory (which
    // doesn't scale and has a race-condition window), we ask Postgres
    // directly for any CONFIRMED booking whose window overlaps the
    // requested one. This single query IS the overlap check:
    //
    //   existing.startTime < newBooking.endTime
    //   AND existing.endTime > newBooking.startTime
    const conflict = await prisma.booking.findFirst({
      where: {
        resourceId: input.resourceId,
        status: BookingStatus.CONFIRMED,
        startTime: { lt: input.endTime },
        endTime: { gt: input.startTime },
      },
    });

    if (conflict) {
      throw new ConflictError('This resource is already booked for the selected time window');
    }

    return prisma.booking.create({
      data: {
        userId,
        resourceId: input.resourceId,
        startTime: input.startTime,
        endTime: input.endTime,
        notes: input.notes,
        status: BookingStatus.CONFIRMED,
      },
    });
  },

  async listForUser(userId: string) {
    return prisma.booking.findMany({
      where: { userId },
      orderBy: { startTime: 'asc' },
      include: { resource: true },
    });
  },

  async listAll() {
    return prisma.booking.findMany({
      orderBy: { startTime: 'asc' },
      include: { resource: true, user: { select: { id: true, name: true, email: true } } },
    });
  },

  async cancel(bookingId: string, requester: { id: string; role: Role }) {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });

    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    const isOwner = booking.userId === requester.id;
    const isPrivileged = requester.role === 'ADMIN' || requester.role === 'MANAGER';

    if (!isOwner && !isPrivileged) {
      throw new ForbiddenError('You can only cancel your own bookings');
    }

    // The cancellation-window policy only applies to regular users.
    // Admins/managers can cancel anytime (e.g. resource maintenance).
    if (!isPrivileged && !canBeCancelled(booking.startTime)) {
      throw new ForbiddenError(
        'Bookings can only be cancelled at least 2 hours before they start'
      );
    }

    return prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.CANCELLED },
    });
  },

  // "Empty the trash": a hard delete, unlike cancel(). Cancelled bookings
  // have no further business purpose once the user chooses to clear them,
  // so this actually removes the rows rather than just changing status.
  async clearCancelled(userId: string) {
    await prisma.booking.deleteMany({
      where: { userId, status: BookingStatus.CANCELLED },
    });
  },
};
