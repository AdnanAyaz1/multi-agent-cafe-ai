import 'server-only';
import { prisma } from '@/lib/db';
import { getMenuForBusiness } from '@/lib/menu';
import { NotFoundError } from '@/lib/errors';
import { ensureWeatherSnapshot } from '@/lib/services/weather/snapshot';
import type { CompetitorData } from '@/lib/types';
import type { PipelineContext, WeatherPipelineInputs } from '@/lib/pipelines/shared/types';

export async function loadInputs(context: PipelineContext): Promise<WeatherPipelineInputs> {
  const business = await prisma.business.findUnique({
    where: { id: context.businessId },
  });
  if (!business) throw new NotFoundError('Business');

  const weather = await ensureWeatherSnapshot({
    businessId: context.businessId,
    city: business.city,
    latitude: business.latitude,
    longitude: business.longitude,
  });

  const menu = await getMenuForBusiness(context.businessId);

  const snapshots = await prisma.dataSnapshot.findMany({
    where: {
      businessId: context.businessId,
      source: 'competitors',
      expiresAt: { gt: new Date() },
    },
    orderBy: { collectedAt: 'desc' },
    take: 5,
  });
  const competitors = snapshots.map((s) => s.data as unknown as CompetitorData);

  return { weather, menu, competitors };
}
