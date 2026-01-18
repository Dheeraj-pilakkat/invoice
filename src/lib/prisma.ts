import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prismaClient: PrismaClient };

export const prisma = globalForPrisma.prismaClient || new PrismaClient({
    accelerateUrl: process.env.DATABASE_URL,
    log: ['query', 'error', 'warn'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prismaClient = prisma;
