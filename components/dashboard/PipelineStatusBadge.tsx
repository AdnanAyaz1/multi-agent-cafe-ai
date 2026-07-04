import {
  CheckCircle2,
  Hourglass,
  Loader2,
  XCircle,
  Ban,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { STATUS_CLASS, STATUS_LABEL } from '@/constants/pipeline-status';
import type { PipelineStatusBadgeProps } from '@/types/dashboard';

export function PipelineStatusBadge({ status }: PipelineStatusBadgeProps) {
  const className = cn(STATUS_CLASS[status] ?? STATUS_CLASS.pending);

  if (status === 'complete') {
    return (
      <Badge className={className}>
        <CheckCircle2 className="size-3 text-success" aria-hidden />
        {STATUS_LABEL.complete}
      </Badge>
    );
  }
  if (status === 'cancelled') {
    return (
      <Badge className={className}>
        <Ban className="size-3" aria-hidden />
        {STATUS_LABEL.cancelled}
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
