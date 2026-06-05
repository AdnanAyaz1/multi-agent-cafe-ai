import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import type { Prisma } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * Bridge a typed domain value to Prisma's JSON column input.
 *
 * Use ONLY with values known to be JSON-serialisable. Safe sources:
 *   - Zod-parsed outputs (no Date / Map / Set / undefined)
 *   - Plain object literals composed in the calling site
 *
 * Unsafe sources (clone first with `structuredClone` or strip manually):
 *   - Raw Prisma rows that include Date fields
 *   - Objects with circular references
 *
 * The signature accepts `unknown` so callers can pass typed interfaces
 * (e.g. `WeatherData`) without an explicit cast at every call site.
 * The trust boundary is the comment block above — not the type system.
 */
export function toPrismaJson(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}
