import { Sparkles, Activity, Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 glass">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <a
            href="#top"
            className="flex items-center gap-2.5"
            aria-label="Agentic AI — back to top"
          >
            <div className="relative flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-info text-primary-foreground shadow-sm shadow-primary/20">
              <Sparkles className="size-4" aria-hidden />
              <span className="absolute -inset-px rounded-xl ring-1 ring-white/20" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold tracking-tight">Agentic AI</span>
              <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                Multi-agent briefing
              </span>
            </div>
          </a>
        </div>
        <nav className="flex items-center gap-2">
          <a
            href="#competitor"
            className="hidden items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs font-medium text-foreground/80 transition hover:border-primary/40 hover:text-foreground sm:inline-flex"
          >
            <Globe className="size-3.5" aria-hidden />
            Competitor scraping
          </a>
          <Badge variant="outline" className="gap-1.5 font-normal">
            <Activity className="size-3 text-success" aria-hidden />
            <span className="hidden sm:inline">Pipeline online</span>
            <span className="sm:hidden">Online</span>
          </Badge>
        </nav>
      </div>
    </header>
  );
}
