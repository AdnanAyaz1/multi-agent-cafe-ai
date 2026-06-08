import { prisma } from '@/lib/db';
import { fetchWeather } from './client';
import type { WeatherData } from '@/lib/types';

const SNAPSHOT_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface EnsureWeatherOptions {
  businessId: string;
  city: string;
  latitude?: number | null;
  longitude?: number | null;
}

/**
 * Returns a fresh weather snapshot for the business.
 * Fetches from the API and saves to DB only if no valid snapshot exists.
 */
export async function ensureWeatherSnapshot(
  opts: EnsureWeatherOptions
): Promise<WeatherData> {
  const fresh = await prisma.dataSnapshot.findFirst({
    where: {
      businessId: opts.businessId,
      source: 'weather',
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    orderBy: { collectedAt: 'desc' },
  });

  if (fresh) {
    return fresh.data as unknown as WeatherData;
  }

  const weather = await fetchWeather(opts.city);

  await prisma.dataSnapshot.create({
    data: {
      businessId: opts.businessId,
      source: 'weather',
      data: weather as object,
      collectedAt: new Date(),
      expiresAt: new Date(Date.now() + SNAPSHOT_TTL_MS),
    },
  });

  return weather;
}
