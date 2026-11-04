import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { UnauthorizedError, NotFoundError, ValidationError } from '@/lib/errors';
import { withErrorHandling } from '@/lib/api/with-error-handling';
import { z } from 'zod';

const updateBusinessSchema = z.object({
  name: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  cities: z.array(z.string().min(1)).optional(),
  timezone: z.string().optional(),
  competitorUrls: z.array(z.string().url()).optional(),
});

export const GET = withErrorHandling(async () => {
  const session = await auth();
  if (!session?.user?.id) throw new UnauthorizedError();

  const business = await prisma.business.findFirst({
    where: { userId: session.user.id },
  });

  if (!business) throw new NotFoundError('Business');

  const rawCities = Array.isArray(business.cities) ? (business.cities as string[]) : [];
  const operationalCities = rawCities.length > 0 ? rawCities : (business.city ? [business.city] : []);
  const config = (business.config as Record<string, unknown> | null) || {};
  const competitorUrls = Array.isArray(config.competitorUrls) ? (config.competitorUrls as string[]) : [];

  return NextResponse.json({
    business: {
      ...business,
      cities: operationalCities,
      competitorUrls,
      isOnboarded: operationalCities.length > 0 && competitorUrls.length > 0,
    },
  });
});

export const PATCH = withErrorHandling(async (request: NextRequest) => {
  const session = await auth();
  if (!session?.user?.id) throw new UnauthorizedError();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new ValidationError('Invalid JSON body');
  }

  const parsed = updateBusinessSchema.parse(body);

  const existing = await prisma.business.findFirst({
    where: { userId: session.user.id },
  });
  if (!existing) throw new NotFoundError('Business');

  const currentConfig = (existing.config as Record<string, unknown> | null) || {};
  const newConfig = {
    ...currentConfig,
    ...(parsed.competitorUrls !== undefined ? { competitorUrls: parsed.competitorUrls } : {}),
  };

  const operationalCities = parsed.cities !== undefined ? parsed.cities : (Array.isArray(existing.cities) ? (existing.cities as string[]) : []);
  const primaryCity = parsed.city || (operationalCities.length > 0 ? operationalCities[0] : existing.city);

  const updated = await prisma.business.update({
    where: { id: existing.id },
    data: {
      ...(parsed.name ? { name: parsed.name } : {}),
      ...(parsed.timezone ? { timezone: parsed.timezone } : {}),
      city: primaryCity,
      cities: operationalCities,
      config: newConfig,
    },
  });

  const updatedCompetitorUrls = Array.isArray((updated.config as Record<string, unknown> | null)?.competitorUrls)
    ? ((updated.config as Record<string, unknown>).competitorUrls as string[])
    : [];

  return NextResponse.json({
    message: 'Business updated successfully',
    business: {
      ...updated,
      cities: operationalCities,
      competitorUrls: updatedCompetitorUrls,
      isOnboarded: operationalCities.length > 0 && updatedCompetitorUrls.length > 0,
    },
  });
});
