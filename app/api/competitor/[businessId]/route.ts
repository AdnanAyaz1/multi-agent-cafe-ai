import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { prisma } from '@/lib/db';
import { competitorSnapshotQuerySchema } from '@/lib/validators/competitor';
import { AppError, NotFoundError } from '@/lib/errors';

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
    if (error instanceof AppError) {
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
          ...(error.details !== undefined ? { details: error.details } : {}),
        },
        { status: error.statusCode }
      );
    }
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: error.flatten(),
        },
        { status: 400 }
      );
    }
    console.error('Unhandled API error:', error);
    const message =
      error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: message, code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
