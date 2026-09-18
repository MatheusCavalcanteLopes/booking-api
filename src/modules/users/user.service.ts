import { prisma } from '../../config/prisma';
import { ForbiddenError, NotFoundError } from '../../shared/errors/AppError';
import { generateAccessToken, generateRefreshToken } from '../../shared/utils/jwt';
import { SetAdminPreviewInput, UpdateLocaleInput } from './user.schema';

const publicSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  locale: true,
  previewRole: true,
} as const;

export const userService = {
  async updateLocale(userId: string, input: UpdateLocaleInput) {
    return prisma.user.update({
      where: { id: userId },
      data: { locale: input.locale },
      select: publicSelect,
    });
  },

  // Temporarily elevates (or restores) the CALLER's own role so a visitor
  // testing with a regular account can exercise the real admin screens —
  // same account, same bookings/history, just different permissions for a
  // while. Self-service, so it can only ever change the caller's own row,
  // and only ever between USER and ADMIN (never MANAGER, never someone
  // else's account).
  async setAdminPreview(userId: string, input: SetAdminPreviewInput) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError('User not found');

    if (input.enabled) {
      if (user.role !== 'USER') {
        throw new ForbiddenError('Admin preview is only available for regular user accounts');
      }
    } else if (user.previewRole === null) {
      throw new ForbiddenError('You are not currently in admin preview');
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: input.enabled
        ? { role: 'ADMIN', previewRole: user.role }
        : { role: user.previewRole!, previewRole: null },
      select: publicSelect,
    });

    // The role just changed, and role lives inside the signed JWT — the
    // caller needs fresh tokens for the new permissions to actually take
    // effect on their very next request, not just in this response body.
    const payload = { sub: updated.id, role: updated.role };
    return {
      accessToken: generateAccessToken(payload),
      refreshToken: generateRefreshToken(payload),
      user: updated,
    };
  },
};
