import { prisma } from '../../config/prisma';
import { NotFoundError } from '../../shared/errors/AppError';
import { CreateResourceInput, UpdateResourceInput } from './resource.schema';

export const resourceService = {
  async create(input: CreateResourceInput) {
    return prisma.resource.create({ data: input });
  },

  async list() {
    return prisma.resource.findMany({ where: { isActive: true } });
  },

  async getById(id: string) {
    const resource = await prisma.resource.findUnique({ where: { id } });
    if (!resource) throw new NotFoundError('Resource not found');
    return resource;
  },

  async update(id: string, input: UpdateResourceInput) {
    await this.getById(id); // ensures 404 instead of a Prisma throw
    return prisma.resource.update({ where: { id }, data: input });
  },

  async deactivate(id: string) {
    await this.getById(id);
    // Soft delete: resources with historical bookings shouldn't
    // disappear, they should just stop accepting new ones.
    return prisma.resource.update({ where: { id }, data: { isActive: false } });
  },
};
