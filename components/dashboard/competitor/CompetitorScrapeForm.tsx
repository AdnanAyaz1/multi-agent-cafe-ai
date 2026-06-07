'use client';

import { useState, type FormEvent } from 'react';
import { Globe, Loader2, RotateCw, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { COMPETITOR_FORM_DEFAULTS, COMPETITOR_URL_OVERRIDE_PLACEHOLDER } from '@/constants/competitor';
import type { RefreshOptions } from '@/hooks/useCompetitorSnapshots';

export interface CompetitorScrapeFormProps {
  businessId: string;
  disabled: boolean;
  busy: boolean;
  onSubmit: (options: RefreshOptions) => void;
}

export function CompetitorScrapeForm({
  businessId,
  disabled,
  busy,
  onSubmit,
}: CompetitorScrapeFormProps) {
  const [url, setUrl] = useState<string>('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({
      ...(url.trim() ? { url: url.trim() } : {}),
      timeoutMs: COMPETITOR_FORM_DEFAULTS.timeoutMs,
      maxTextLength: COMPETITOR_FORM_DEFAULTS.maxTextLength,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-2xl border border-border/60 bg-muted/30 p-4"
    >
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="competitor-url"
          className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
        >
          URL override
        </label>
        <div className="relative">
          <Globe
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            id="competitor-url"
            name="url"
            type="url"
            inputMode="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder={COMPETITOR_URL_OVERRIDE_PLACEHOLDER}
            className="pl-9"
            disabled={busy}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Scraping for business <span className="font-mono text-foreground/80">{businessId}</span>.
          Leave blank to use every URL stored in{' '}
          <span className="font-mono text-foreground/80">Business.config.competitorUrls</span>.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={disabled || busy} className="gap-1.5">
          {busy ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              {url.trim() ? 'Scraping…' : 'Enqueueing all URLs…'}
            </>
          ) : (
            <>
              <Send className="size-4" aria-hidden />
              Run scrape
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onSubmit({})}
          disabled={disabled || busy}
          className="gap-1.5"
        >
          <RotateCw className="size-4" aria-hidden />
          Re-scrape stored URLs
        </Button>
      </div>
    </form>
  );
}
