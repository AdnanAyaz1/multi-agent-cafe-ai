import 'server-only';
import { logger } from '@/lib/logger';
import { runWeatherPipeline } from '@/lib/pipelines/weather';
import { runCompetitorPipeline } from '@/lib/pipelines/competitor';
import type { PipelineContext, PipelineResult, PipelineType } from '@/lib/pipelines/shared/types';

const log = logger.child('pipelines');

export type { PipelineContext, PipelineResult, PipelineType };

export async function runPipeline(
  context: PipelineContext
): Promise<PipelineResult> {
  log.info('dispatching pipeline', {
    pipelineId: context.pipelineId,
    pipelineType: context.pipelineType,
    businessId: context.businessId,
  });

  switch (context.pipelineType) {
    case 'weather':
      return runWeatherPipeline(context);
    case 'competitor':
      return runCompetitorPipeline(context);
    default:
      throw new Error(`Unknown pipeline type: ${context.pipelineType}`);
  }
}
