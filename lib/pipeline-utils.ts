import type { PipelineAgentRun, AgentGroupingResult } from '@/types/analysis';
import { AGENT_DISPLAY_ORDER } from '@/constants/agents';

export type { AgentGroupingResult };

export function groupRunsByAgent(runs: PipelineAgentRun[]): AgentGroupingResult {
  const byAgent = new Map<string, PipelineAgentRun[]>();
  for (const run of runs) {
    const list = byAgent.get(run.agentName) ?? [];
    list.push(run);
    byAgent.set(run.agentName, list);
  }

  const completedCount = AGENT_DISPLAY_ORDER.filter((role) => {
    const agentRuns = byAgent.get(role) ?? [];
    return agentRuns.length > 0 && agentRuns.every((r) => r.status === 'complete');
  }).length;

  const progress = (completedCount / AGENT_DISPLAY_ORDER.length) * 100;

  return { byAgent, completedCount, progress };
}

export function computeAgentStepStatus(
  role: string,
  byAgent: Map<string, PipelineAgentRun[]>,
  isRunning: boolean,
  index: number
): 'complete' | 'active' | 'pending' | 'failed' {
  const agentRuns = byAgent.get(role) ?? [];
  const isComplete = agentRuns.length > 0 && agentRuns.every((r) => r.status === 'complete');
  const isAgentRunning = agentRuns.some((r) => r.status === 'running');
  const isFailed = agentRuns.some((r) => r.status === 'failed');
  const hasRun = agentRuns.length > 0;

  const isFirstPending = isRunning && !hasRun && !AGENT_DISPLAY_ORDER.slice(0, index).some((prevRole) => {
    const prevRuns = byAgent.get(prevRole) ?? [];
    return prevRuns.length === 0 || prevRuns.some((r) => r.status === 'running' || r.status === 'pending');
  }) && AGENT_DISPLAY_ORDER.slice(0, index).every((prevRole) => {
    const prevRuns = byAgent.get(prevRole) ?? [];
    return prevRuns.length > 0 && prevRuns.every((r) => r.status === 'complete');
  });

  if (isComplete) return 'complete';
  if (isAgentRunning || isFirstPending) return 'active';
  if (isFailed) return 'failed';
  return 'pending';
}
