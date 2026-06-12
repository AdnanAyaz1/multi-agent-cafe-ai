'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, Send, RotateCw, Loader2 } from 'lucide-react';
import { COMPETITOR_FORM_DEFAULTS, COMPETITOR_URL_OVERRIDE_PLACEHOLDER } from '@/constants/competitor';
import type { ScrapeFormProps } from '@/types/dashboard-home';

export function ScrapeForm({ businessId, disabled, busy, onSubmit }: ScrapeFormProps) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...(url.trim() ? { url: url.trim() } : {}),
      timeoutMs: COMPETITOR_FORM_DEFAULTS.timeoutMs,
      maxTextLength: COMPETITOR_FORM_DEFAULTS.maxTextLength,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-1.5">
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#859399]" />
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={COMPETITOR_URL_OVERRIDE_PLACEHOLDER}
            disabled={busy}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white text-sm placeholder:text-[#859399]/50 focus:outline-none focus:border-[#00d2ff]/30 focus:ring-1 focus:ring-[#00d2ff]/20 transition-all duration-300 disabled:opacity-50"
          />
        </div>
        <motion.button type="submit" disabled={disabled || busy} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#00d2ff] to-[#1fe19e] text-[#003543] text-sm font-bold hover:shadow-lg hover:shadow-[#00d2ff]/20 disabled:opacity-50 transition-all duration-300 flex items-center gap-2">
          {busy ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}><Loader2 className="w-4 h-4" /></motion.div> : <Send className="w-4 h-4" />}
          Scrape
        </motion.button>
        <motion.button type="button" onClick={() => onSubmit({})} disabled={disabled || busy} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="px-4 py-3 rounded-xl border border-white/[0.08] bg-white/[0.03] text-[#859399] text-sm font-medium hover:bg-white/[0.06] hover:border-white/[0.15] hover:text-white disabled:opacity-50 transition-all duration-300 flex items-center gap-2">
          <RotateCw className="w-4 h-4" />
          Re-scrape
        </motion.button>
      </div>
      <p className="px-4 pt-2 text-[10px] text-[#859399]" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
        Scraping for <span className="text-[#00d2ff]">{businessId}</span> — leave URL blank to scrape all stored URLs
      </p>
    </form>
  );
}
