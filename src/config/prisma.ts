import { PrismaClient } from '@prisma/client';

/**
 * A single PrismaClient instance is reused across the whole app.
 * Creating a new client per request would exhaust database connections.
 */
export const prisma = new PrismaClient();
