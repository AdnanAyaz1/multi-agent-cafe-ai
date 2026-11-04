import 'server-only';
import { StateGraph, Annotation, START, END } from '@langchain/langgraph';
import type {
  CompetitorParserOutput,
  CompetitorAnalystOutput,
  MenuAnalystOutput,
  StrategistOutput,
  CriticOutput,
  SynthesizerOutput,
  WeatherAnalystOutput,
} from '@/lib/agents/types';
import type { PipelineRunContext } from '@/lib/pipelines/shared/types';
import type { Menu } from '@/lib/menu';
import type { CompetitorData } from '@/lib/types';
import { runCompetitorParser } from '@/lib/agents/competitor-parser';
import { runCompetitorAnalyst } from '@/lib/agents/competitor-analyst';
import { runMenuAnalyst } from '@/lib/agents/menu-analyst';
import { runStrategist } from '@/lib/agents/strategist';
import { runCritic, criticHasBlockers } from '@/lib/agents/critic';
import { runSynthesizer } from '@/lib/agents/synthesizer';
import { MAX_REVISIONS } from '@/lib/agents/models';
import { runAbortableParallel } from '@/lib/pipelines/abort';
import { competitorWeatherData, FLAT_DEMAND } from './helpers';
import { logger } from '@/lib/logger';

const log = logger.child('pipelines.competitor.graph');

const emptyWeather: WeatherAnalystOutput = {
  headline: '',
  tempBucket: 'mild',
  precipitation: 'none',
  comfortIndex: 'pleasant',
  consumerSignals: [],
  expectedDemandShift: FLAT_DEMAND,
};

/**
 * State channel schema for the LangGraph Competitor Pipeline
 */
export const CompetitorPipelineState = Annotation.Root({
  ctx: Annotation<PipelineRunContext>(),
  menu: Annotation<Menu>(),
  competitorSnapshots: Annotation<CompetitorData[]>(),
  parsedCompetitors: Annotation<CompetitorParserOutput[]>(),
  competitorAnalysis: Annotation<CompetitorAnalystOutput>(),
  menuAnalysis: Annotation<MenuAnalystOutput>(),
  strategistOutput: Annotation<StrategistOutput>(),
  criticOutput: Annotation<CriticOutput>(),
  synthesizerOutput: Annotation<SynthesizerOutput>(),
  revisions: Annotation<number>({
    reducer: (curr, next) => next ?? curr,
    default: () => 0,
  }),
});

export type CompetitorGraphState = typeof CompetitorPipelineState.State;

// Node 1: Parse all competitor scrapes in parallel
async function parseCompetitorsNode(state: CompetitorGraphState) {
  await state.ctx.throwIfCancelled();
  log.info('LangGraph node: parseCompetitors', { pipelineId: state.ctx.pipelineId });

  const parsed = await runAbortableParallel(
    state.ctx,
    state.competitorSnapshots.map((snap) => (c) =>
      runCompetitorParser(
        {
          scrape: {
            url: snap.url,
            finalUrl: snap.finalUrl,
            title: snap.brand ?? '',
            text: snap.notes.join('. '),
            scrapedAt: snap.scrapedAt,
          },
        },
        c
      ).then((r) => r.output)
    )
  );

  return { parsedCompetitors: parsed };
}

// Node 2: Competitor Analyst (cross-menu comparison)
async function competitorAnalystNode(state: CompetitorGraphState) {
  await state.ctx.throwIfCancelled();
  log.info('LangGraph node: competitorAnalyst', { pipelineId: state.ctx.pipelineId });

  const result = await runCompetitorAnalyst(
    {
      competitors: state.competitorSnapshots.map((snap, i) => ({
        brand: snap.brand ?? state.parsedCompetitors[i]?.brand ?? null,
        items: snap.items,
        promos: snap.promos,
        notes: snap.notes,
      })),
      ourMenu: state.menu.items.map((item) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        price: item.price,
      })),
    },
    state.ctx
  );

  return { competitorAnalysis: result.output };
}

// Node 3: Menu Analyst (internal margin and structure)
async function menuAnalystNode(state: CompetitorGraphState) {
  await state.ctx.throwIfCancelled();
  log.info('LangGraph node: menuAnalyst', { pipelineId: state.ctx.pipelineId });
  const result = await runMenuAnalyst({ menu: state.menu }, state.ctx);
  return { menuAnalysis: result.output };
}

// Node 4: Strategist (develops competitive counter-moves and pricing)
async function strategistNode(state: CompetitorGraphState) {
  await state.ctx.throwIfCancelled();
  const weatherForStrategist = competitorWeatherData(state.competitorAnalysis);
  const nextRevision = state.criticOutput ? state.revisions + 1 : 0;

  log.info('LangGraph node: strategist', {
    pipelineId: state.ctx.pipelineId,
    revision: nextRevision,
  });

  const result = await runStrategist(
    {
      menuAnalysis: state.menuAnalysis,
      weatherAnalysis: weatherForStrategist,
      rawMenu: state.menu,
      competitorData: state.competitorSnapshots,
      competitorAnalysis: state.competitorAnalysis,
      criticFeedback: state.criticOutput,
      revision: nextRevision,
    },
    state.ctx
  );

  return {
    strategistOutput: result.output,
    revisions: nextRevision,
  };
}

// Node 5: Critic (reviews actions against margins and feasibility)
async function criticNode(state: CompetitorGraphState) {
  await state.ctx.throwIfCancelled();
  log.info('LangGraph node: critic', {
    pipelineId: state.ctx.pipelineId,
    revision: state.revisions,
  });

  const result = await runCritic(
    {
      menuAnalysis: state.menuAnalysis,
      weatherAnalysis: emptyWeather,
      strategistOutput: state.strategistOutput,
    },
    state.ctx
  );

  return { criticOutput: result.output };
}

// Node 6: Synthesizer (crafts final executive briefing)
async function synthesizerNode(state: CompetitorGraphState) {
  await state.ctx.throwIfCancelled();
  log.info('LangGraph node: synthesizer', { pipelineId: state.ctx.pipelineId });

  const result = await runSynthesizer(
    {
      menuAnalysis: state.menuAnalysis,
      weatherAnalysis: {
        headline: 'Competitor intelligence gathered',
        tempBucket: 'mild',
        precipitation: 'none',
        comfortIndex: 'pleasant',
        consumerSignals: state.competitorAnalysis.recommendations.slice(0, 4),
        expectedDemandShift: FLAT_DEMAND,
      },
      strategistOutput: state.strategistOutput,
      criticOutput: state.criticOutput,
    },
    state.ctx
  );

  return { synthesizerOutput: result.output };
}

// Conditional routing edge after Critic
function routeCritic(state: CompetitorGraphState): 'strategist' | 'synthesizer' {
  const hasBlockers = criticHasBlockers(state.criticOutput);
  if (hasBlockers && state.revisions < MAX_REVISIONS) {
    log.info('LangGraph competitor conditional edge: revision requested', {
      pipelineId: state.ctx.pipelineId,
      currentRevision: state.revisions,
      maxAllowed: MAX_REVISIONS,
    });
    return 'strategist';
  }
  return 'synthesizer';
}

/**
 * Compiled LangGraph state machine for Competitor-driven cafe recommendations
 */
export const competitorPipelineGraph = new StateGraph(CompetitorPipelineState)
  .addNode('parseCompetitors', parseCompetitorsNode)
  .addNode('competitorAnalyst', competitorAnalystNode)
  .addNode('menuAnalyst', menuAnalystNode)
  .addNode('strategist', strategistNode)
  .addNode('critic', criticNode)
  .addNode('synthesizer', synthesizerNode)

  // Step 1: Scrapes pass to parser
  .addEdge(START, 'parseCompetitors')

  // Step 2: Once parsed, run competitor analyst and menu analyst in parallel
  .addEdge('parseCompetitors', 'competitorAnalyst')
  .addEdge('parseCompetitors', 'menuAnalyst')

  // Step 3: Fan-in to Strategist
  .addEdge('competitorAnalyst', 'strategist')
  .addEdge('menuAnalyst', 'strategist')

  // Step 4: Strategist to Critic
  .addEdge('strategist', 'critic')

  // Step 5: Cyclic feedback loop
  .addConditionalEdges('critic', routeCritic, {
    strategist: 'strategist',
    synthesizer: 'synthesizer',
  })

  // Step 6: Synthesizer completes
  .addEdge('synthesizer', END)
  .compile();
