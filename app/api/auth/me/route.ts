import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { UnauthorizedError, NotFoundError } from '@/lib/errors';
import { withErrorHandling } from '@/lib/api/with-error-handling';

export const GET = withErrorHandling(async () => {
  const session = await auth();
  if (!session?.user?.id) throw new UnauthorizedError();

  const business = await prisma.business.findFirst({
    where: { userId: session.user.id },
    select: {
      id: true,
      name: true,
      city: true,
      cities: true,
      type: true,
      timezone: true,
      config: true,
      createdAt: true,
    },
  });

  if (!business) throw new NotFoundError('Business');

  const rawCities = Array.isArray(business.cities) ? (business.cities as string[]) : [];
  const operationalCities = rawCities.length > 0 ? rawCities : (business.city ? [business.city] : []);
  const config = (business.config as Record<string, unknown> | null) || {};
  const competitorUrls = Array.isArray(config.competitorUrls) ? (config.competitorUrls as string[]) : [];

  const isOnboarded = operationalCities.length > 0 && competitorUrls.length > 0;

  return NextResponse.json({
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
    },
    business: {
      ...business,
      cities: operationalCities,
      competitorUrls,
      isOnboarded,
    },
  });
});
