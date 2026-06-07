import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export interface FeatureCardProps {
  href: string;
  eyebrow: string;
  title: string;
  description: string;
}

export function FeatureCard({ href, eyebrow, title, description }: FeatureCardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-5 text-card-foreground shadow-sm ring-1 ring-foreground/5 transition-all hover:border-primary/40 hover:shadow-md hover:ring-primary/20"
    >
      <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-primary">
        {eyebrow}
      </span>
      <span className="text-base font-semibold tracking-tight">{title}</span>
      <span className="text-sm text-muted-foreground">{description}</span>
      <span className="mt-auto inline-flex items-center gap-1 text-xs font-medium text-foreground/80 transition-colors group-hover:text-primary">
        Open
        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
      </span>
    </Link>
  );
}
