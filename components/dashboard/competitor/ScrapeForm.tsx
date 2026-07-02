'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Globe, Send, RotateCw, Loader2 } from 'lucide-react';
import { COMPETITOR_FORM_DEFAULTS, COMPETITOR_URL_OVERRIDE_PLACEHOLDER } from '@/constants/competitor';
import { competitorRefreshRequestSchema } from '@/lib/validators/competitor';
import type { ScrapeFormProps } from '@/types/dashboard-home';

type ScrapeFormInput = { url?: string };

export function ScrapeForm({ businessId, disabled, busy, onSubmit }: ScrapeFormProps) {
  const form = useForm<ScrapeFormInput>({
    resolver: zodResolver(competitorRefreshRequestSchema.partial()),
    defaultValues: { url: '' },
  });

  const handleSubmit = (data: ScrapeFormInput) => {
    onSubmit({
      ...(data.url?.trim() ? { url: data.url.trim() } : {}),
      timeoutMs: COMPETITOR_FORM_DEFAULTS.timeoutMs,
      maxTextLength: COMPETITOR_FORM_DEFAULTS.maxTextLength,
    });
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="glass-card rounded-2xl p-1.5">
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="url"
            {...form.register('url')}
            placeholder={COMPETITOR_URL_OVERRIDE_PLACEHOLDER}
            disabled={busy}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-[#e07850]/30 focus:ring-1 focus:ring-[#e07850]/20 transition-all duration-150 disabled:opacity-50"
          />
        </div>
        <button type="submit" disabled={disabled || busy} className="px-5 py-3 rounded-xl bg-[#e07850] text-white text-sm font-bold hover:bg-blue-600 disabled:opacity-50 transition-all duration-150 flex items-center gap-2">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Scrape
        </button>
        <button type="button" onClick={() => onSubmit({})} disabled={disabled || busy} className="px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 text-sm font-medium hover:bg-zinc-800 hover:text-white disabled:opacity-50 transition-all duration-150 flex items-center gap-2">
          <RotateCw className="w-4 h-4" />
          Re-scrape
        </button>
      </div>
      <p className="px-4 pt-2 text-[10px] text-zinc-400">
        Scraping for <span className="text-[#e07850]">{businessId}</span> — leave URL blank to scrape all stored URLs
      </p>
    </form>
  );
}
