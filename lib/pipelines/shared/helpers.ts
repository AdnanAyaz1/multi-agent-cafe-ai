import 'server-only';
import { prisma } from '@/lib/db';
import type { PipelineContext, PersistArgs } from './types';

export function priorityFromActions(strategist: PersistArgs['strategist']): number {
  const min = strategist.actions.reduce((acc, a) => Math.min(acc, a.priority), 5);
  return 6 - min;
}

export async function persistRecommendation(
  context: PipelineContext,
  args: PersistArgs,
  category: string,
  analysisData: Record<string, unknown>
): Promise<{ id: string }> {
  return prisma.recommendation.create({
    data: {
      businessId: context.businessId,
      summary: args.synthesizer.headline,
      reasoning: args.synthesizer.briefingMarkdown,
      confidence: args.finalConfidence,
      category,
      priority: priorityFromActions(args.strategist),
      status: 'pending',
      dataAnalysis: JSON.parse(
        JSON.stringify({ pipelineId: context.pipelineId, ...analysisData })
      ) as object,
      criticNotes: JSON.parse(JSON.stringify(args.critic)) as object,
      actions: {
        create: args.strategist.actions.map((a) => ({
          actionType: a.action,
          item: a.itemName,
          details: JSON.parse(
            JSON.stringify({
              itemId: a.itemId,
              priority: a.priority,
              reason: a.reason,
              discountPercent: a.discountPercent,
            })
          ) as object,
        })),
      },
    },
    select: { id: true },
  });
}
