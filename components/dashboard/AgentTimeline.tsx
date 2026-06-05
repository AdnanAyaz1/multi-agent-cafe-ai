'use client';

import { AGENT_NAMES } from '@/constants/agents';
import { statusClass } from '@/utils/agentRun';
import type { PipelineAgentRun } from '@/lib/api/analysis';

interface AgentTimelineProps {
  runs: PipelineAgentRun[];
}

export function AgentTimeline({ runs }: AgentTimelineProps) {
  const byAgent = new Map<string, PipelineAgentRun[]>();
  for (const run of runs) {
    const list = byAgent.get(run.agentName) ?? [];
    list.push(run);
    byAgent.set(run.agentName, list);
  }

  return (
    <div>
      <h3 className="mb-2 text-lg font-semibold">Agent Timeline</h3>
      <ol className="space-y-2">
        {AGENT_NAMES.map((name) => {
          const agentRuns = byAgent.get(name) ?? [];
          if (agentRuns.length === 0) {
            return (
              <li
                key={name}
                className="rounded border border-dashed p-3 text-sm text-gray-400"
              >
                {name} &mdash; pending
              </li>
            );
          }
          return agentRuns.map((r, idx) => (
            <li
              key={r.id}
              className={`rounded border p-3 text-sm ${statusClass(r.status)}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {name}
                  {agentRuns.length > 1 ? ` (round ${idx + 1})` : ''}
                </span>
                <span className="text-xs uppercase tracking-wide">
                  {r.status}
                </span>
              </div>
              <div className="mt-1 text-xs text-gray-600">
                {r.durationMs != null && <>duration: {r.durationMs}ms</>}
                {r.tokenCount != null && <> &middot; tokens: {r.tokenCount}</>}
              </div>
              {r.error && (
                <div className="mt-1 text-xs text-destructive">{r.error}</div>
              )}
            </li>
          ));
        })}
      </ol>
    </div>
  );
}
