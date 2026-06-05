import type { AgentRunStatus } from '@/lib/api/analysis';

/** Tailwind classes for an AgentRun's lifecycle status. */
export function statusClass(status: AgentRunStatus): string {
  switch (status) {
    case 'complete':
      return 'border-green-300 bg-green-50';
    case 'failed':
      return 'border-red-300 bg-red-50';
    case 'running':
      return 'border-blue-300 bg-blue-50';
    case 'pending':
    default:
      return 'border-gray-200 bg-white';
  }
}
