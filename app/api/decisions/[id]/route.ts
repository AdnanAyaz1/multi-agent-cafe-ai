import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { NotFoundError, UnauthorizedError } from '@/lib/errors';
import { withErrorHandling } from '@/lib/api/with-error-handling';

const patchSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  reason: z.string().optional(),
});

export const PATCH = withErrorHandling(async (
  request: NextRequest,
  ctx: RouteContext<'/api/decisions/[id]'>
) => {
  const session = await auth();
  if (!session?.user?.id) throw new UnauthorizedError();

  const { id } = await ctx.params;
  const body = await patchSchema.parse(await request.json());

  const decision = await prisma.decision.findUnique({ where: { id } });
  if (!decision) throw new NotFoundError('Decision');

  const updated = await prisma.decision.update({
    where: { id },
    data: {
      status: body.status,
      reason: body.reason,
      decidedAt: new Date(),
    },
  });

  return NextResponse.json(updated);
});
