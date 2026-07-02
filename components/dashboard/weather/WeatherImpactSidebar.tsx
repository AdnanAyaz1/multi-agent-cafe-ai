import { IMPACT_MESSAGES } from '@/utils/weather';
import { IMPACT_ACTIONS } from '@/constants/weather-display';
import type { WeatherImpactSidebarProps } from '@/types/component-props';

export function WeatherImpactSidebar({ impact }: WeatherImpactSidebarProps) {
  return (
    <div className="glass-card rounded-3xl overflow-hidden h-full">
      <div className="relative z-10 p-6 h-full flex flex-col">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#e07850]/10 border border-[#e07850]/20">
            <span className="text-[#e07850] text-sm font-bold">AI</span>
          </div>
          <div>
            <p className="text-white text-sm font-bold">Business Impact</p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">AI analysis</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="relative mb-6">
            <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#e07850] transition-all duration-1000 ease-out"
                style={{ width: impact === 'high' ? '90%' : impact === 'medium' ? '55%' : '25%' }}
              />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-[8px] text-zinc-500 uppercase font-mono">Low</span>
              <span className="text-[8px] text-zinc-500 uppercase font-mono">High</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl mb-4 bg-zinc-900 border border-zinc-800">
            <p className="text-3xl font-extrabold mb-1 text-white">
              {impact.charAt(0).toUpperCase() + impact.slice(1)}
            </p>
            <p className="text-zinc-500 text-xs uppercase tracking-wider font-mono">Impact level</p>
          </div>

          <p className="text-zinc-400 text-sm leading-relaxed flex-1">
            {IMPACT_MESSAGES[impact]}
          </p>

          <div className="mt-6 space-y-2">
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mb-3 font-mono">Suggested actions</p>
            {IMPACT_ACTIONS[impact].map((action, i) => (
              <div key={action} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-all duration-150 cursor-pointer group">
                <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 bg-[#e07850]/10 group-hover:scale-110 transition-transform">
                  <span className="text-[9px] font-bold font-mono text-[#e07850]">{i + 1}</span>
                </div>
                <span className="text-[12px] text-white/70 group-hover:text-white transition-colors">{action}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
