import { prisma } from '../../config/prisma';
import { UpdateLocaleInput } from './user.schema';

export const userService = {
  async updateLocale(userId: string, input: UpdateLocaleInput) {
    return prisma.user.update({
      where: { id: userId },
      data: { locale: input.locale },
      select: { id: true, name: true, email: true, role: true, locale: true },
    });
  },
};
