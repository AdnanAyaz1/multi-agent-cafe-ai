import 'server-only';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  const adapter = new PrismaPg({ connectionString: url });
  return new PrismaClient({ adapter });
}

let _prisma: PrismaClient | null = null;

function getPrisma(): PrismaClient {
  if (!_prisma) {
    _prisma = globalForPrisma.prisma || createPrismaClient();
    if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = _prisma;
  }
  return _prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop) {
    const target = getPrisma();
    const value = (target as unknown as Record<string | symbol, unknown>)[prop];
    if (typeof value === 'function') {
      return value.bind(target);
    }
    return value;
  },
});
