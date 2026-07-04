import type { PipelineRunStatus } from '@/constants/pipeline';

export const STATUS_CLASS: Record<PipelineRunStatus, string> = {
  complete:
    'gap-1 bg-success/15 text-success-foreground ring-1 ring-success/30 hover:bg-success/15',
  failed:
    'gap-1 bg-destructive/15 text-destructive ring-1 ring-destructive/30 hover:bg-destructive/15',
  running:
    'gap-1 bg-info/15 text-info-foreground ring-1 ring-info/30 hover:bg-info/15',
  pending: 'gap-1 text-muted-foreground',
  cancelled:
    'gap-1 bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30 hover:bg-amber-500/15',
};

export const STATUS_LABEL: Record<PipelineRunStatus, string> = {
  complete: 'Complete',
  failed: 'Failed',
  running: 'Running',
  pending: 'Pending',
  cancelled: 'Cancelled',
};
