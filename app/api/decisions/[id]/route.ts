import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import handleError from '@/lib/handlers/errors';

const patchSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  reason: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<'/api/decisions/[id]'>
) {
  try {
    const { id } = await ctx.params;
    const body = await patchSchema.parse(await request.json());

    const decision = await prisma.decision.findUnique({ where: { id } });
    if (!decision) {
      return NextResponse.json({ error: 'Decision not found' }, { status: 404 });
    }

    const updated = await prisma.decision.update({
      where: { id },
      data: {
        status: body.status,
        reason: body.reason,
        decidedAt: new Date(),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return handleError(error) as NextResponse;
  }
}
