'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Search, Loader2, Sparkles } from 'lucide-react';
import type { AnalysisSearchFormProps } from '@/types/component-props';

export function AnalysisSearchForm({
  form,
  isRunning,
  loading,
  error,
  onSubmit,
  onCancel,
}: AnalysisSearchFormProps) {
  const businessId = form.watch('businessId');

  return (
    <div className="glass-card rounded-2xl p-1.5 max-w-2xl">
      <form onSubmit={onSubmit} className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            {...form.register('businessId')}
            onKeyDown={(e) => e.key === 'Enter' && !isRunning && onSubmit()}
            placeholder="Enter business ID (e.g. cafe-001)"
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-[#e89070]/30 focus:ring-1 focus:ring-[#e89070]/20 transition-all duration-150"
          />
        </div>
        {isRunning ? (
          <button type="button" onClick={onCancel} className="px-6 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-bold hover:bg-red-500/30 transition-all duration-150 flex items-center gap-2">
            Stop Pipeline
          </button>
        ) : (
          <button type="submit" disabled={loading || !businessId.trim()} className="px-6 py-3 rounded-xl bg-[#e07850] text-white text-sm font-bold hover:bg-blue-600 disabled:opacity-50 transition-all duration-150 flex items-center gap-2">
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Run Pipeline
          </button>
        )}
      </form>
      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="px-4 pb-2 text-sm text-red-400">
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
