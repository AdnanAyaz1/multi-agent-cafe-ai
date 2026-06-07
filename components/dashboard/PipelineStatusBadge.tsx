import {
  CheckCircle2,
  Hourglass,
  Loader2,
  XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type PipelineRunStatus = 'pending' | 'running' | 'complete' | 'failed';

const STATUS_CLASS: Record<PipelineRunStatus, string> = {
  complete:
    'gap-1 bg-success/15 text-success-foreground ring-1 ring-success/30 hover:bg-success/15',
  failed:
    'gap-1 bg-destructive/15 text-destructive ring-1 ring-destructive/30 hover:bg-destructive/15',
  running:
    'gap-1 bg-info/15 text-info-foreground ring-1 ring-info/30 hover:bg-info/15',
  pending: 'gap-1 text-muted-foreground',
};

const STATUS_LABEL: Record<PipelineRunStatus, string> = {
  complete: 'Complete',
  failed: 'Failed',
  running: 'Running',
  pending: 'Pending',
};

export function PipelineStatusBadge({ status }: { status: PipelineRunStatus }) {
  const className = cn(STATUS_CLASS[status] ?? STATUS_CLASS.pending);

  if (status === 'complete') {
    return (
      <Badge className={className}>
        <CheckCircle2 className="size-3 text-success" aria-hidden />
        {STATUS_LABEL.complete}
      </Badge>
    );
  }
  if (status === 'failed') {
    return (
      <Badge className={className}>
        <XCircle className="size-3" aria-hidden />
        {STATUS_LABEL.failed}
      </Badge>
    );
  }
  if (status === 'running') {
    return (
      <Badge className={className}>
        <Loader2 className="size-3 animate-spin" aria-hidden />
        {STATUS_LABEL.running}
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className={className}>
      <Hourglass className="size-3" aria-hidden />
      {STATUS_LABEL.pending}
    </Badge>
  );
}
