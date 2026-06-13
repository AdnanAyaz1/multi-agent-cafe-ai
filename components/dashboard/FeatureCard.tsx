import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { FeatureCardProps } from '@/types/dashboard';

export function FeatureCard({ href, eyebrow, title, description }: FeatureCardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-3 rounded-lg border border-border bg-card p-5 text-card-foreground shadow-sm transition-all hover:shadow-md hover:border-primary/30"
    >
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
        {eyebrow}
      </span>
      <span className="text-base font-semibold tracking-tight font-heading">{title}</span>
      <span className="text-sm text-muted-foreground">{description}</span>
      <span className="mt-auto inline-flex items-center gap-1 text-xs font-medium text-foreground/80 transition-colors group-hover:text-primary">
        Open
        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
      </span>
    </Link>
  );
}
