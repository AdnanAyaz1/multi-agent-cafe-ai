import 'server-only';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { getMenuForBusiness } from '@/lib/menu';
import { NotFoundError } from '@/lib/errors';
import { ensureWeatherSnapshot } from '@/lib/services/weather/snapshot';
import type { WeatherData, CompetitorData } from '@/lib/types';
import { runMenuAnalyst } from '@/lib/agents/menu-analyst';
import { runWeatherAnalyst } from '@/lib/agents/weather-analyst';
import { runStrategist } from '@/lib/agents/strategist';
import { runCritic, criticHasBlockers } from '@/lib/agents/critic';
import { runSynthesizer, deriveFinalConfidence } from '@/lib/agents/synthesizer';
import { MAX_REVISIONS } from '@/lib/agents/models';
import { isPipelineCancelled, clearCancellationFlag } from '@/lib/pipelines/cancel';
import type {
  StrategistOutput,
  CriticOutput,
  MenuAnalystOutput,
  WeatherAnalystOutput,
  SynthesizerOutput,
} from '@/lib/agents/types';
import type { PipelineContext } from '@/lib/pipelines/shared/types';
import type { PipelineResult } from '@/lib/pipelines/shared/types';

const log = logger.child('pipelines.weather');

interface WeatherPipelineInputs {
  weather: WeatherData;
  menu: Awaited<ReturnType<typeof getMenuForBusiness>>;
  competitors: CompetitorData[];
}

async function loadInputs(context: PipelineContext): Promise<WeatherPipelineInputs> {
  const business = await prisma.business.findUnique({
    where: { id: context.businessId },
  });
  if (!business) throw new NotFoundError('Business');

  const weather = await ensureWeatherSnapshot({
    businessId: context.businessId,
    city: business.city,
    latitude: business.latitude,
    longitude: business.longitude,
  });

  const menu = await getMenuForBusiness(context.businessId);

  const snapshots = await prisma.dataSnapshot.findMany({
    where: {
      businessId: context.businessId,
      source: 'competitors',
      expiresAt: { gt: new Date() },
    },
    orderBy: { collectedAt: 'desc' },
    take: 5,
  });
  const competitors = snapshots.map((s) => s.data as unknown as CompetitorData);

  return { weather, menu, competitors };
}

interface PersistArgs {
  menuAnalysis: MenuAnalystOutput;
  weatherAnalysis: WeatherAnalystOutput;
  strategist: StrategistOutput;
  critic: CriticOutput;
  synthesizer: SynthesizerOutput;
  finalConfidence: string;
}

async function persistRecommendation(
  context: PipelineContext,
  args: PersistArgs
): Promise<{ id: string }> {
  return prisma.recommendation.create({
    data: {
      businessId: context.businessId,
      summary: args.synthesizer.headline,
      reasoning: args.synthesizer.briefingMarkdown,
      confidence: args.finalConfidence,
      category: 'marketing',
      priority: priorityFromActions(args.strategist),
      status: 'pending',
      dataAnalysis: JSON.parse(
        JSON.stringify({
          pipelineId: context.pipelineId,
          pipelineType: 'weather',
          menuAnalysis: args.menuAnalysis,
          weatherAnalysis: args.weatherAnalysis,
        })
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

function priorityFromActions(strategist: StrategistOutput): number {
  const min = strategist.actions.reduce(
    (acc, a) => Math.min(acc, a.priority),
    5
  );
  return 6 - min;
}

/**
 * Weather Pipeline
 *
 * Flow:
 *   1. Load weather snapshot + menu + competitor context
 *   2. Menu Analyst + Weather Analyst (parallel)
 *   3. Strategist (with competitor awareness)
 *   4. Critic -> loop back to Strategist if blockers + revisions remain
 *   5. Synthesizer
 *   6. Persist Recommendation + RecommendationAction[] rows
 */
export async function runWeatherPipeline(
  context: PipelineContext
): Promise<PipelineResult> {
  const start = Date.now();
  log.info('weather pipeline start', { ...context });

  try {
    const { weather, menu, competitors } = await loadInputs(context);

      // Check cancellation after data loading
    if (await isPipelineCancelled(context.pipelineId)) {
      throw 'Pipeline cancelled by user';
    }

    const [menuAnalysis, weatherAnalysis] = await Promise.all([
      runMenuAnalyst({ menu }, context).then((r) => r.output),
      runWeatherAnalyst({ weather }, context).then((r) => r.output),
    ]);

    // Check cancellation after parallel analysts
    if (await isPipelineCancelled(context.pipelineId)) {
      throw 'Pipeline cancelled by user';
    }

    let strategist: StrategistOutput = (
      await runStrategist(
        { menuAnalysis, weatherAnalysis, rawMenu: menu, competitorData: competitors, revision: 0 },
        context
      )
    ).output;

    // Check cancellation after strategist
    if (await isPipelineCancelled(context.pipelineId)) {
      throw 'Pipeline cancelled by user';
    }

    let critic: CriticOutput = (
      await runCritic(
        { menuAnalysis, weatherAnalysis, strategistOutput: strategist },
        context
      )
    ).output;

    let revisions = 0;
    while (criticHasBlockers(critic) && revisions < MAX_REVISIONS) {
      revisions += 1;
      log.info('revision triggered', {
        pipelineId: context.pipelineId,
        round: revisions,
        blockers: critic.issues.filter((i) => i.severity === 'blocker').length,
      });

      // Check cancellation before each revision
      if (await isPipelineCancelled(context.pipelineId)) {
        throw 'Pipeline cancelled by user';
      }

      strategist = (
        await runStrategist(
          {
            menuAnalysis,
            weatherAnalysis,
            rawMenu: menu,
            competitorData: competitors,
            criticFeedback: critic,
            revision: revisions,
          },
          context
        )
      ).output;

      // Check cancellation after strategist revision
      if (await isPipelineCancelled(context.pipelineId)) {
        throw 'Pipeline cancelled by user';
      }

      critic = (
        await runCritic(
          { menuAnalysis, weatherAnalysis, strategistOutput: strategist },
          context
        )
      ).output;
    }

    // Check cancellation before synthesizer
    if (await isPipelineCancelled(context.pipelineId)) {
      throw 'Pipeline cancelled by user';
    }

    const synthesizer: SynthesizerOutput = (
      await runSynthesizer(
        {
          menuAnalysis,
          weatherAnalysis,
          strategistOutput: strategist,
          criticOutput: critic,
        },
        context
      )
    ).output;

    const finalConfidence = deriveFinalConfidence(strategist.confidence, critic);

    const recommendation = await persistRecommendation(context, {
      menuAnalysis,
      weatherAnalysis,
      strategist,
      critic,
      synthesizer,
      finalConfidence,
    });

    const durationMs = Date.now() - start;
    log.info('weather pipeline complete', {
      pipelineId: context.pipelineId,
      recommendationId: recommendation.id,
      revisions,
      durationMs,
    });

    // Clear Redis cancellation flag only on full success.
    // On cancellation, the flag stays so BullMQ worker knows not to retry.
    await clearCancellationFlag(context.pipelineId);

    return {
      pipelineId: context.pipelineId,
      recommendationId: recommendation.id,
      revisions,
      durationMs,
      pipelineType: 'weather',
    };
  } catch (error) {
    // Don't clear Redis flag on cancellation — let it stay so BullMQ
    // worker knows this was cancelled and doesn't re-run on retry.
    // Flag auto-expires after 10 minutes.
    throw error;
  }
}
