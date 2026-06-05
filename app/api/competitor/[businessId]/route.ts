import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { competitorSnapshotQuerySchema } from '@/lib/validators/competitor';
import { NotFoundError } from '@/lib/errors';
import { withApiHandler } from '@/lib/api/handler';
import { COMPETITOR_SNAPSHOT_DEFAULT_LIMIT } from '@/constants/queues';

export const GET = withApiHandler(
  async (
    request: NextRequest,
    ctx: RouteContext<'/api/competitor/[businessId]'>
  ) => {
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
      take: limit ?? COMPETITOR_SNAPSHOT_DEFAULT_LIMIT,
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
  }
);
