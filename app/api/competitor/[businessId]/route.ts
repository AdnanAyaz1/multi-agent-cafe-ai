import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { competitorSnapshotQuerySchema } from '@/lib/validators/competitor';
import { NotFoundError } from '@/lib/errors';
import handleError from '@/lib/handlers/errors';

export async function GET(
  request: NextRequest,
  ctx: RouteContext<'/api/competitor/[businessId]'>
) {
  try {
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
  } catch (error) {
    return handleError(error) as NextResponse;
  }
}
