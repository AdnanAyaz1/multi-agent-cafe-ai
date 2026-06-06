'use client';

import { useState } from 'react';
import { useAnalysis, type PipelineAgentRun } from '@/hooks/useAnalysis';

const DEFAULT_BUSINESS_ID = 'test-biz-1';

export default function AnalysisPanel() {
  const [businessId, setBusinessId] = useState(DEFAULT_BUSINESS_ID);
  const { pipelineId, status, loading, error, run, cancel } = useAnalysis();

  const onRun = () => {
    if (businessId.trim()) run(businessId.trim());
  };

  return (
    <section className="mx-auto mt-8 max-w-3xl space-y-6 p-6">
      <header>
        <h2 className="text-2xl font-bold">Daily AI Briefing</h2>
        <p className="text-sm text-gray-600">
          Runs the 5-agent pipeline (Menu &rarr; Weather &rarr; Strategist &rarr; Critic &rarr; Synthesizer)
          against the latest weather snapshot and the cafe&apos;s menu.
        </p>
      </header>

      <div className="flex gap-2">
        <input
          type="text"
          value={businessId}
          onChange={(e) => setBusinessId(e.target.value)}
          placeholder="Business ID"
          className="flex-1 rounded-lg border px-4 py-2"
          disabled={loading}
        />
        <button
          onClick={onRun}
          disabled={loading || !businessId.trim()}
          className="rounded-lg bg-indigo-600 px-6 py-2 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {loading ? 'Running...' : 'Run Analysis'}
        </button>
        {loading && (
          <button
            onClick={cancel}
            className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
          >
            Stop polling
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-400 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {pipelineId && (
        <p className="text-xs text-gray-500">
          Pipeline: <code>{pipelineId}</code> &middot; status: {status?.status ?? 'pending'}
        </p>
      )}

      {status && <AgentTimeline runs={status.agentRuns} />}

      {status?.recommendation && (
        <RecommendationView recommendation={status.recommendation} />
      )}
    </section>
  );
}

const AGENT_ORDER = [
  'menu-analyst',
  'weather-analyst',
  'strategist',
  'critic',
  'synthesizer',
] as const;

function AgentTimeline({ runs }: { runs: PipelineAgentRun[] }) {
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
        {AGENT_ORDER.map((name) => {
          const agentRuns = byAgent.get(name) ?? [];
          if (agentRuns.length === 0) {
            return (
              <li key={name} className="rounded border border-dashed p-3 text-sm text-gray-400">
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
                <span className="text-xs uppercase tracking-wide">{r.status}</span>
              </div>
              <div className="mt-1 text-xs text-gray-600">
                {r.durationMs != null && <>duration: {r.durationMs}ms</>}
                {r.tokenCount != null && <> &middot; tokens: {r.tokenCount}</>}
              </div>
              {r.error && <div className="mt-1 text-xs text-red-700">{r.error}</div>}
            </li>
          ));
        })}
      </ol>
    </div>
  );
}

function statusClass(status: string): string {
  switch (status) {
    case 'complete':
      return 'border-green-300 bg-green-50';
    case 'failed':
      return 'border-red-300 bg-red-50';
    case 'running':
      return 'border-blue-300 bg-blue-50';
    default:
      return 'border-gray-200 bg-white';
  }
}

function RecommendationView({
  recommendation,
}: {
  recommendation: NonNullable<ReturnType<typeof useAnalysis>['status']>['recommendation'];
}) {
  if (!recommendation) return null;
  return (
    <article className="rounded-lg border bg-white p-4 shadow-sm">
      <header className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold">{recommendation.summary}</h3>
        <span className="rounded bg-indigo-100 px-2 py-1 text-xs uppercase text-indigo-700">
          {recommendation.confidence}
        </span>
      </header>
      <pre className="mb-4 whitespace-pre-wrap break-words rounded bg-gray-50 p-3 font-sans text-sm leading-relaxed">
        {recommendation.reasoning}
      </pre>
      <h4 className="mb-2 text-sm font-semibold">Actions ({recommendation.actions.length})</h4>
      <ul className="space-y-1 text-sm">
        {recommendation.actions.map((a) => {
          const details = a.details as
            | { reason?: string; priority?: number; discountPercent?: number }
            | null;
          return (
            <li key={a.id} className="rounded border bg-gray-50 p-2">
              <div className="flex items-center justify-between">
                <span>
                  <strong className="uppercase">{a.actionType}</strong> &mdash; {a.item}
                  {details?.discountPercent ? ` (-${details.discountPercent}%)` : ''}
                </span>
                {details?.priority != null && (
                  <span className="text-xs text-gray-500">p{details.priority}</span>
                )}
              </div>
              {details?.reason && (
                <p className="mt-1 text-xs text-gray-600">{details.reason}</p>
              )}
            </li>
          );
        })}
      </ul>
    </article>
  );
}
