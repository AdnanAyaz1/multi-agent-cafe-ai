import { Activity, CheckCircle2, XCircle, Zap } from 'lucide-react';
import { StatCardGrid } from '../ui/StatCardGrid';
import type { StatCardData } from '@/types/dashboard';
import type { AnalysisStatsProps } from '@/types/dashboard';

export function AnalysisStats({ status }: AnalysisStatsProps) {
  const completed = status.agentRuns.filter((r) => r.status === 'complete').length;
  const failed = status.agentRuns.filter((r) => r.status === 'failed').length;
  const totalTokens = status.agentRuns.reduce((sum, r) => sum + (r.tokenCount ?? 0), 0);

  const cards: StatCardData[] = [
    {
      label: 'Pipeline Status',
      value: status.status.charAt(0).toUpperCase() + status.status.slice(1),
      icon: Activity,
      iconBg: 'bg-info/10',
      iconColor: 'text-info',
    },
    {
      label: 'Agents Completed',
      value: String(completed),
      icon: CheckCircle2,
      iconBg: 'bg-success/30',
      iconColor: 'text-success-foreground',
    },
    {
      label: 'Failed',
      value: String(failed),
      icon: XCircle,
      iconBg: 'bg-destructive/5',
      iconColor: 'text-destructive',
    },
    {
      label: 'Total Tokens',
      value: totalTokens.toLocaleString(),
      icon: Zap,
      iconBg: 'bg-accent/20',
      iconColor: 'text-secondary',
    },
  ];

  return <StatCardGrid cards={cards} />;
}
