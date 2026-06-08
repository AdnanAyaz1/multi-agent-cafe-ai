import { cn } from '@/lib/utils';
import type { TimelineProps, TimelineStepProps } from '@/types/dashboard';
import { Card } from './Card';
import { CardHeading } from './CardHeading';

export function TimelineStepIndicator({ step }: TimelineStepProps) {
  if (step.status === 'complete') {
    return (
      <div className="absolute left-1 w-6 h-6 rounded-full bg-success flex items-center justify-center ring-4 ring-card z-10">
        <span className="text-success-foreground text-[10px] font-bold">✓</span>
      </div>
    );
  }

  if (step.status === 'active') {
    return (
      <div className="absolute left-1 w-6 h-6 rounded-full bg-secondary active-glow flex items-center justify-center ring-4 ring-card z-10">
        <div className="w-2 h-2 bg-primary-foreground rounded-full animate-pulse" />
      </div>
    );
  }

  if (step.status === 'failed') {
    return (
      <div className="absolute left-1 w-6 h-6 rounded-full bg-destructive flex items-center justify-center ring-4 ring-card z-10">
        <span className="text-destructive-foreground text-[10px] font-bold">!</span>
      </div>
    );
  }

  return (
    <div className="absolute left-1 w-6 h-6 rounded-full bg-muted flex items-center justify-center ring-4 ring-card z-10">
      <div className="w-2 h-2 bg-muted-foreground/30 rounded-full" />
    </div>
  );
}

export function TimelineStepItem({ step }: TimelineStepProps) {
  return (
    <div className="relative flex items-start gap-6 pl-12">
      <TimelineStepIndicator step={step} />
      <div>
        <h4
          className={cn(
            'text-lg font-semibold leading-none',
            step.status === 'pending' || step.status === 'failed'
              ? 'text-muted-foreground'
              : 'text-card-foreground'
          )}
        >
          {step.label}
        </h4>
        <p
          className={cn(
            'mt-1',
            step.status === 'pending'
              ? 'text-muted-foreground/60'
              : step.status === 'active'
                ? 'text-muted-foreground italic'
                : 'text-muted-foreground'
          )}
        >
          {step.description}
        </p>
      </div>
    </div>
  );
}

export function Timeline({ title, steps, className }: TimelineProps) {
  return (
    <Card padding="lg" className={className}>
      <CardHeading className="mb-6">{title}</CardHeading>
      <div className="relative space-y-8">
        <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-muted" />
        {steps.map((step) => (
          <TimelineStepItem key={step.label} step={step} />
        ))}
      </div>
    </Card>
  );
}
