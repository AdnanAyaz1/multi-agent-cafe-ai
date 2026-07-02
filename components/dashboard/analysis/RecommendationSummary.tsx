import { Lightbulb } from 'lucide-react';
import { RecommendationMarkdown } from './RecommendationMarkdown';
import type { RecommendationSummaryProps } from '@/types/component-props';

export function RecommendationSummary({ recommendation }: RecommendationSummaryProps) {
  return (
    <div className="glass-card rounded-3xl overflow-hidden">
      <div className="relative z-10">
        <div className="p-6 lg:p-8 bg-zinc-900 border-b border-zinc-800">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Lightbulb className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <p className="text-white text-lg font-bold">Strategic Recommendation</p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">AI-optimized for maximum revenue</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-500 border border-green-500/20 font-mono">
              {recommendation.actions[0]?.actionType ?? 'Recommendation'}
            </span>
            <span className="text-sm font-bold text-amber-500">{recommendation.confidence} confidence</span>
          </div>
        </div>

        <div className="p-6 lg:p-8">
          <p className="text-zinc-400 text-sm leading-relaxed mb-6">{recommendation.summary}</p>

          {recommendation.reasoning && (
            <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 mb-6">
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mb-3 font-mono">Full Briefing</p>
              <RecommendationMarkdown content={recommendation.reasoning} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
