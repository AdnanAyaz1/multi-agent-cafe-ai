import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { UnauthorizedError } from '@/lib/errors';
import { parseBody } from '@/lib/validators';
import { withErrorHandling } from '@/lib/api/with-error-handling';

const AUTO_APPROVE_THRESHOLD = 10;

const createDecisionsSchema = z.object({
  businessId: z.string().min(1),
  recommendationId: z.string().min(1),
  summary: z.string().optional(),
  confidence: z.string().optional(),
  actions: z.array(z.object({
    id: z.string().min(1),
    actionType: z.string().min(1),
    item: z.string().min(1),
    details: z.object({
      reason: z.string().optional(),
      priority: z.number().optional(),
      discountPercent: z.number().optional(),
      itemId: z.string().optional(),
    }).optional(),
  })),
});

function classifyAction(actionType: string, discountPercent?: number): string {
  if (discountPercent != null && discountPercent > 0 && discountPercent < AUTO_APPROVE_THRESHOLD) return 'auto-approved';
  if (actionType === 'hold' || actionType === 'promote') return 'auto-approved';
  return 'pending';
}

export const GET = withErrorHandling(async (request: NextRequest) => {
  const session = await auth();
  if (!session?.user?.id) throw new UnauthorizedError();

  const { searchParams } = new URL(request.url);
  const businessId = searchParams.get('businessId');
  const status = searchParams.get('status');
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') ?? '20', 10)));
  const skip = (page - 1) * pageSize;

  const where: Record<string, unknown> = {};
  if (businessId) where.businessId = businessId;
  if (status) where.status = status;

  const [decisions, total] = await Promise.all([
    prisma.decision.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.decision.count({ where }),
  ]);

  return NextResponse.json({
    decisions,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const session = await auth();
  if (!session?.user?.id) throw new UnauthorizedError();

  const body = await parseBody(request, createDecisionsSchema);

  const existing = await prisma.decision.findMany({
    where: {
      actionId: { in: body.actions.map((a) => a.id) },
    },
    select: { actionId: true },
  });
  const existingIds = new Set(existing.map((d: { actionId: string }) => d.actionId));

  const toCreate = body.actions
    .filter((a) => !existingIds.has(a.id))
    .map((action) => ({
      businessId: body.businessId,
      actionId: action.id,
      actionType: action.actionType,
      item: action.item,
      details: action.details ?? undefined,
      status: classifyAction(action.actionType, action.details?.discountPercent),
      confidence: body.confidence ?? undefined,
      summary: body.summary ?? undefined,
    }));

  if (toCreate.length > 0) {
    await prisma.decision.createMany({ data: toCreate });
  }

  return NextResponse.json({ created: toCreate.length }, { status: 201 });
});
