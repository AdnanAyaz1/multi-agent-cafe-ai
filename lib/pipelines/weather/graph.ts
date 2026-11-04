import 'server-only';
import { StateGraph, Annotation, START, END } from '@langchain/langgraph';
import type {
  MenuAnalystOutput,
  WeatherAnalystOutput,
  StrategistOutput,
  CriticOutput,
  SynthesizerOutput,
} from '@/lib/agents/types';
import type { PipelineRunContext } from '@/lib/pipelines/shared/types';
import type { WeatherSnapshot } from '@/lib/services/weather/types';
import type { MenuWithItems } from '@/lib/menu';
import type { CompetitorData } from '@/lib/types';
import { runMenuAnalyst } from '@/lib/agents/menu-analyst';
import { runWeatherAnalyst } from '@/lib/agents/weather-analyst';
import { runStrategist } from '@/lib/agents/strategist';
import { runCritic, criticHasBlockers } from '@/lib/agents/critic';
import { runSynthesizer } from '@/lib/agents/synthesizer';
import { MAX_REVISIONS } from '@/lib/agents/models';
import { logger } from '@/lib/logger';

const log = logger.child('pipelines.weather.graph');

/**
 * State channel schema for the LangGraph Weather Pipeline
 */
export const WeatherPipelineState = Annotation.Root({
  ctx: Annotation<PipelineRunContext>(),
  menu: Annotation<MenuWithItems>(),
  weather: Annotation<WeatherSnapshot>(),
  competitors: Annotation<CompetitorData[]>(),
  menuAnalysis: Annotation<MenuAnalystOutput>(),
  weatherAnalysis: Annotation<WeatherAnalystOutput>(),
  strategistOutput: Annotation<StrategistOutput>(),
  criticOutput: Annotation<CriticOutput>(),
  synthesizerOutput: Annotation<SynthesizerOutput>(),
  revisions: Annotation<number>({
    reducer: (curr, next) => next ?? curr,
    default: () => 0,
  }),
});

export type WeatherGraphState = typeof WeatherPipelineState.State;

// Node 1: Menu Analyst
async function menuAnalystNode(state: WeatherGraphState) {
  await state.ctx.throwIfCancelled();
  log.info('LangGraph node: menuAnalyst', { pipelineId: state.ctx.pipelineId });
  const result = await runMenuAnalyst({ menu: state.menu }, state.ctx);
  return { menuAnalysis: result.output };
}

// Node 2: Weather Analyst
async function weatherAnalystNode(state: WeatherGraphState) {
  await state.ctx.throwIfCancelled();
  log.info('LangGraph node: weatherAnalyst', { pipelineId: state.ctx.pipelineId });
  const result = await runWeatherAnalyst({ weather: state.weather }, state.ctx);
  return { weatherAnalysis: result.output };
}

// Node 3: Strategist (handles initial formulation and revisions)
async function strategistNode(state: WeatherGraphState) {
  await state.ctx.throwIfCancelled();
  log.info('LangGraph node: strategist', {
    pipelineId: state.ctx.pipelineId,
    revision: state.revisions,
  });
  const result = await runStrategist(
    {
      menuAnalysis: state.menuAnalysis,
      weatherAnalysis: state.weatherAnalysis,
      rawMenu: state.menu,
      competitorData: state.competitors,
      criticFeedback: state.criticOutput,
      revision: state.revisions,
    },
    state.ctx
  );
  return { strategistOutput: result.output };
}

// Node 4: Critic (validates recommendations and checks blockers)
async function criticNode(state: WeatherGraphState) {
  await state.ctx.throwIfCancelled();
  log.info('LangGraph node: critic', {
    pipelineId: state.ctx.pipelineId,
    revision: state.revisions,
  });
  const result = await runCritic(
    {
      menuAnalysis: state.menuAnalysis,
      weatherAnalysis: state.weatherAnalysis,
      strategistOutput: state.strategistOutput,
    },
    state.ctx
  );
  return {
    criticOutput: result.output,
    revisions: state.revisions + 1,
  };
}

// Node 5: Synthesizer (creates the owner-facing executive briefing)
async function synthesizerNode(state: WeatherGraphState) {
  await state.ctx.throwIfCancelled();
  log.info('LangGraph node: synthesizer', { pipelineId: state.ctx.pipelineId });
  const result = await runSynthesizer(
    {
      menuAnalysis: state.menuAnalysis,
      weatherAnalysis: state.weatherAnalysis,
      strategistOutput: state.strategistOutput,
      criticOutput: state.criticOutput,
    },
    state.ctx
  );
  return { synthesizerOutput: result.output };
}

// Conditional routing edge after Critic: loop back to Strategist or proceed
function routeCritic(state: WeatherGraphState): 'strategist' | 'synthesizer' {
  const hasBlockers = criticHasBlockers(state.criticOutput);
  if (hasBlockers && state.revisions < MAX_REVISIONS) {
    log.info('LangGraph conditional edge: revision requested by critic', {
      pipelineId: state.ctx.pipelineId,
      round: state.revisions,
    });
    return 'strategist';
  }
  log.info('LangGraph conditional edge: critic approved or max revisions reached, moving to synthesizer', {
    pipelineId: state.ctx.pipelineId,
  });
  return 'synthesizer';
}

/**
 * Compiled LangGraph state machine for Weather-driven cafe recommendations
 */
export const weatherPipelineGraph = new StateGraph(WeatherPipelineState)
  .addNode('menuAnalyst', menuAnalystNode)
  .addNode('weatherAnalyst', weatherAnalystNode)
  .addNode('strategist', strategistNode)
  .addNode('critic', criticNode)
  .addNode('synthesizer', synthesizerNode)

  // Step 1: Run menu analyst and weather analyst in parallel fan-out
  .addEdge(START, 'menuAnalyst')
  .addEdge(START, 'weatherAnalyst')

  // Step 2: Fan-in to Strategist once both analyses are ready
  .addEdge('menuAnalyst', 'strategist')
  .addEdge('weatherAnalyst', 'strategist')

  // Step 3: Strategist output passes to Critic
  .addEdge('strategist', 'critic')

  // Step 4: Critic conditional branch (loop or advance)
  .addConditionalEdges('critic', routeCritic, {
    strategist: 'strategist',
    synthesizer: 'synthesizer',
  })

  // Step 5: Synthesizer completes the graph
  .addEdge('synthesizer', END)
  .compile();
