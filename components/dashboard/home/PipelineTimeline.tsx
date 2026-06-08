import type { PipelineAgentRun } from '@/hooks/useAnalysis';
import { AGENT_DISPLAY_ORDER, AGENT_CONFIG } from '@/constants/agents';
import { Card } from '../ui/Card';
import { CardHeading } from '../ui/CardHeading';
import { TimelineStepIndicator } from '../ui/Timeline';
import type { PipelineTimelineProps } from '@/types/dashboard';

export function PipelineTimeline({ runs }: PipelineTimelineProps) {
  const byAgent = new Map<string, PipelineAgentRun[]>();
  for (const run of runs) {
    const list = byAgent.get(run.agentName) ?? [];
    list.push(run);
    byAgent.set(run.agentName, list);
  }

  return (
    <Card padding="lg">
      <CardHeading className="mb-6">Agent Pipeline</CardHeading>
      <div className="relative space-y-8">
        <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-muted" />

        {AGENT_DISPLAY_ORDER.map((role) => {
          const agentRuns = byAgent.get(role) ?? [];
          const config = AGENT_CONFIG[role];
          const hasRun = agentRuns.length > 0;
          const isRunning = agentRuns.some((r) => r.status === 'running');
          const isFailed = agentRuns.some((r) => r.status === 'failed');
          const isComplete = agentRuns.every((r) => r.status === 'complete');

          const status = isComplete ? 'complete' : isRunning ? 'active' : isFailed ? 'failed' : 'pending';

          return (
            <div key={role} className="relative flex items-start gap-6 pl-12">
              <TimelineStepIndicator step={{ label: config.name, description: '', status }} />

              <div className="flex-1">
                <h4 className={`text-lg font-semibold leading-none ${hasRun ? 'text-card-foreground' : 'text-muted-foreground'}`}>
                  {config.name}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5 mb-1">{config.description}</p>

                {isRunning && (
                  <p className="text-sm text-muted-foreground italic mt-1">Running...</p>
                )}

                {agentRuns.map((run) => (
                  <div key={run.id} className="mt-2 text-xs text-muted-foreground">
                    {run.durationMs != null && <span>{run.durationMs}ms</span>}
                    {run.tokenCount != null && (
                      <span className="ml-2 font-mono">{run.tokenCount.toLocaleString()} tokens</span>
                    )}
                    {run.error && <span className="text-destructive ml-2">{run.error}</span>}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
