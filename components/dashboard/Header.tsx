import Link from 'next/link';
import { Sparkles, Activity, Cloud, BarChart3, Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Agentic AI — home">
            <div className="relative flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Sparkles className="size-4" aria-hidden />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold tracking-tight font-heading">Agentic AI</span>
              <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                Multi-agent briefing
              </span>
            </div>
          </Link>
        </div>
        <nav className="flex items-center gap-1">
          <Link
            href="/weather"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1 text-xs font-medium text-foreground/80 transition hover:bg-muted hover:text-foreground"
          >
            <Cloud className="size-3.5" aria-hidden />
            <span className="hidden sm:inline">Weather</span>
          </Link>
          <Link
            href="/analysis"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1 text-xs font-medium text-foreground/80 transition hover:bg-muted hover:text-foreground"
          >
            <BarChart3 className="size-3.5" aria-hidden />
            <span className="hidden sm:inline">Analysis</span>
          </Link>
          <Link
            href="/competitors"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1 text-xs font-medium text-foreground/80 transition hover:bg-muted hover:text-foreground"
          >
            <Globe className="size-3.5" aria-hidden />
            <span className="hidden sm:inline">Competitors</span>
          </Link>
          <Badge variant="outline" className="gap-1.5 font-normal">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex size-2 rounded-full bg-success"></span>
            </span>
            <span className="hidden sm:inline">Pipeline online</span>
            <span className="sm:hidden">Online</span>
          </Badge>
        </nav>
      </div>
    </header>
  );
}
