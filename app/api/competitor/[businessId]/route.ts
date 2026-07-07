import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { competitorSnapshotQuerySchema } from '@/lib/validators/competitor';
import { NotFoundError, UnauthorizedError } from '@/lib/errors';
import { withErrorHandling } from '@/lib/api/with-error-handling';

export const GET = withErrorHandling(async (
  request: NextRequest,
  ctx: RouteContext<'/api/competitor/[businessId]'>
) => {
  const session = await auth();
  if (!session?.user?.id) throw new UnauthorizedError();

  const { businessId } = await ctx.params;
  const url = new URL(request.url);

  const { limit } = competitorSnapshotQuerySchema.parse({
    businessId,
    limit: url.searchParams.get('limit') ?? undefined,
  });

  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { id: true, name: true },
  });
  if (!business) throw new NotFoundError(`Business ${businessId}`);

  const snapshots = await prisma.dataSnapshot.findMany({
    where: { businessId, source: 'competitors' },
    orderBy: { collectedAt: 'desc' },
    take: limit ?? 10,
    select: {
      id: true,
      collectedAt: true,
      expiresAt: true,
      data: true,
    },
  });

  return NextResponse.json({
    businessId,
    businessName: business.name,
    count: snapshots.length,
    snapshots,
  });
});
