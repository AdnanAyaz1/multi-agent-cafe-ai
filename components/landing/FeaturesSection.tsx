import Link from "next/link";
import { FEATURES } from "@/constants/landing";
import { FEATURE_ICONS } from "@/constants/icons";

const PIPELINE_AGENTS = [
  { name: "Menu Analyst", role: "Menu & Margin Mix", model: "gpt-oss-20b", tag: "Step 1" },
  { name: "Weather Analyst", role: "Demand & Signals", model: "gpt-oss-20b", tag: "Step 2" },
  { name: "Strategist", role: "Price & Promo Ideas", model: "gpt-oss-20b", tag: "Step 3" },
  { name: "Critic", role: "Risk & Guardrails", model: "gpt-oss-20b", tag: "Step 4" },
  { name: "Synthesizer", role: "Daily Briefing", model: "gpt-oss-20b", tag: "Step 5" },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-16 sm:py-24 lg:py-40 relative">
      <div className="section-divider absolute top-0 left-0 w-full" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="reveal mb-12 sm:mb-20 lg:mb-24">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="h-px w-8 sm:w-10" style={{ background: "linear-gradient(90deg, transparent, rgba(224, 120, 80, 0.3))" }} />
            <p className="text-[10px] uppercase tracking-[0.3em] font-semibold"
              style={{ fontFamily: "var(--font-jetbrains-mono)", color: "#e07850" }}>
              Features
            </p>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[56px] xl:text-[64px] font-bold text-white mb-4 sm:mb-6 leading-[1.1] sm:leading-[1.05] tracking-tight"
            style={{ fontFamily: "var(--font-sora)" }}>
            Everything you need to <span className="gradient-text">stay ahead</span>
          </h2>
          <p className="text-base sm:text-lg max-w-xl leading-relaxed"
            style={{ color: "rgba(184, 176, 168, 0.9)" }}>
            Three powerful modules working together to give your cafe an unfair advantage.
          </p>
        </div>

        {/* Bento grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-5">
          {/* Card 1: Weather Intelligence (Spans 7 cols on desktop, 1 col on tablet) */}
          <div
            className="reveal-scale md:col-span-1 lg:col-span-7 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 group relative overflow-hidden cursor-default transition-all duration-500 hover:border-[rgba(224,120,80,0.25)] flex flex-col justify-between"
            style={{
              background: "linear-gradient(160deg, rgba(30, 27, 24, 0.95), rgba(20, 18, 16, 0.9))",
              border: "1px solid rgba(224, 120, 80, 0.15)",
            }}
          >
            {/* Hover glow orb */}
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-all duration-1000 pointer-events-none"
              style={{ background: "rgba(224, 120, 80, 0.08)" }} />

            <div className="relative z-10">
              <div className="flex items-start gap-4 sm:gap-5 mb-5 sm:mb-6">
                <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:scale-105 group-hover:shadow-[0_0_24px_-4px_rgba(224,120,80,0.25)] transition-all duration-500"
                  style={{ background: "rgba(224, 120, 80, 0.08)", border: "1px solid rgba(224, 120, 80, 0.12)", color: "#e07850" }}>
                  {FEATURE_ICONS.weather}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="inline-block px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-wider font-semibold mb-2"
                    style={{ background: "rgba(224, 120, 80, 0.1)", color: "#e07850", fontFamily: "var(--font-jetbrains-mono)" }}>
                    Real-time Signals
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight group-hover:text-[#f5dcc8] transition-colors duration-500"
                    style={{ fontFamily: "var(--font-sora)" }}>
                    {FEATURES[0].title}
                  </h3>
                </div>
              </div>

              <p className="leading-relaxed text-sm sm:text-[15px] mb-6"
                style={{ color: "rgba(184, 176, 168, 0.85)" }}>
                {FEATURES[0].description}
              </p>

              {/* Weather intelligence interactive preview widget */}
              <div className="rounded-xl sm:rounded-2xl p-4 sm:p-5"
                style={{ background: "rgba(18, 16, 14, 0.75)", border: "1px solid rgba(224, 120, 80, 0.08)" }}>
                <div className="flex items-center justify-between gap-2 flex-wrap mb-3 pb-3"
                  style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
                  <div className="flex items-center gap-2">
                    <span className="text-base sm:text-lg">☀️</span>
                    <span className="text-xs sm:text-sm font-semibold text-white">28°C Sunny & High UV</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full text-emerald-400 bg-emerald-500/10 font-mono">
                    High Demand Forecast
                  </span>
                </div>
                <div className="space-y-2 text-xs" style={{ color: "rgba(184, 176, 168, 0.85)" }}>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#e07850]" />
                      Cold Brew & Iced Matcha
                    </span>
                    <span className="text-white font-medium">+18% projected volume</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#c8a070]" />
                      Promo Suggestion
                    </span>
                    <span className="text-white font-medium">Afternoon iced refresher bundle</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Competitor Tracking (Spans 5 cols on desktop, 1 col on tablet) */}
          <div
            className="reveal-scale md:col-span-1 lg:col-span-5 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 group relative overflow-hidden cursor-default transition-all duration-500 hover:border-[rgba(200,160,112,0.25)] flex flex-col justify-between"
            style={{
              background: "linear-gradient(160deg, rgba(30, 27, 24, 0.95), rgba(20, 18, 16, 0.9))",
              border: "1px solid rgba(200, 160, 112, 0.15)",
            }}
          >
            <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-all duration-1000 pointer-events-none"
              style={{ background: "rgba(200, 160, 112, 0.08)" }} />

            <div className="relative z-10">
              <div className="flex items-start gap-4 sm:gap-5 mb-5 sm:mb-6">
                <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:scale-105 group-hover:shadow-[0_0_24px_-4px_rgba(200,160,112,0.25)] transition-all duration-500"
                  style={{ background: "rgba(200, 160, 112, 0.08)", border: "1px solid rgba(200, 160, 112, 0.12)", color: "#c8a070" }}>
                  {FEATURE_ICONS.competitor}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="inline-block px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-wider font-semibold mb-2"
                    style={{ background: "rgba(200, 160, 112, 0.1)", color: "#c8a070", fontFamily: "var(--font-jetbrains-mono)" }}>
                    Automated Radar
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight group-hover:text-[#f5dcc8] transition-colors duration-500"
                    style={{ fontFamily: "var(--font-sora)" }}>
                    {FEATURES[1].title}
                  </h3>
                </div>
              </div>

              <p className="leading-relaxed text-sm sm:text-[15px] mb-6"
                style={{ color: "rgba(184, 176, 168, 0.85)" }}>
                {FEATURES[1].description}
              </p>

              {/* Competitor radar preview widget */}
              <div className="rounded-xl sm:rounded-2xl p-4 sm:p-5"
                style={{ background: "rgba(18, 16, 14, 0.75)", border: "1px solid rgba(200, 160, 112, 0.08)" }}>
                <div className="flex items-center justify-between mb-3 pb-3"
                  style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs sm:text-sm font-semibold text-white">Daily Web Scraping</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono">3 Cafes Tracked</span>
                </div>
                <div className="space-y-2 text-xs" style={{ color: "rgba(184, 176, 168, 0.85)" }}>
                  <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white font-medium">Coffee Lab (0.3 mi)</span>
                      <span className="text-amber-400 font-mono">+$0.50</span>
                    </div>
                    <p className="text-[11px] text-zinc-400">Raised Oat Flat White to $6.25</p>
                  </div>
                  <div className="text-[11px] text-[#c8a070] flex items-center gap-1.5 pt-1">
                    <span>💡 Recommendation: Keep price at $5.75 to attract margin volume</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: 5-Agent AI Pipeline (Spans full width across all 12 columns) */}
          <div
            className="reveal-scale md:col-span-2 lg:col-span-12 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 group relative overflow-hidden cursor-default transition-all duration-500 hover:border-[rgba(224,120,80,0.25)]"
            style={{
              background: "linear-gradient(160deg, rgba(30, 27, 24, 0.95), rgba(20, 18, 16, 0.9))",
              border: "1px solid rgba(224, 120, 80, 0.15)",
            }}
          >
            <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-all duration-1000 pointer-events-none"
              style={{ background: "rgba(224, 120, 80, 0.06)" }} />

            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-start sm:items-center gap-4">
                  <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:scale-105 group-hover:shadow-[0_0_24px_-4px_rgba(224,120,80,0.25)] transition-all duration-500"
                    style={{ background: "rgba(224, 120, 80, 0.08)", border: "1px solid rgba(224, 120, 80, 0.12)", color: "#e07850" }}>
                    {FEATURE_ICONS.agents}
                  </div>
                  <div>
                    <div className="inline-block px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-wider font-semibold mb-1"
                      style={{ background: "rgba(224, 120, 80, 0.1)", color: "#e07850", fontFamily: "var(--font-jetbrains-mono)" }}>
                      Multi-Agent Consensus
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight group-hover:text-[#f5dcc8] transition-colors duration-500"
                      style={{ fontFamily: "var(--font-sora)" }}>
                      {FEATURES[2].title}
                    </h3>
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 self-start sm:self-auto px-3 py-1.5 rounded-full text-xs bg-white/[0.04] border border-white/[0.06] text-zinc-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Sequential Pipeline with Validation</span>
                </div>
              </div>

              <p className="leading-relaxed text-sm sm:text-[15px] mb-8 max-w-3xl"
                style={{ color: "rgba(184, 176, 168, 0.85)" }}>
                {FEATURES[2].description} Every morning, specialized LLMs review your cafe data in sequence to eliminate hallucinations and produce high-confidence suggestions.
              </p>

              {/* 5-Agent Interactive Visual Pipeline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {PIPELINE_AGENTS.map((agent, idx) => (
                  <div
                    key={agent.name}
                    className="p-4 rounded-xl sm:rounded-2xl relative transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between"
                    style={{
                      background: "rgba(18, 16, 14, 0.8)",
                      border: "1px solid rgba(255, 255, 255, 0.06)",
                    }}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md"
                          style={{
                            background: idx === 4 ? "rgba(224, 120, 80, 0.2)" : "rgba(255, 255, 255, 0.05)",
                            color: idx === 4 ? "#e07850" : "rgba(200, 180, 160, 0.8)",
                          }}>
                          {agent.tag}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {agent.model}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-white mb-1" style={{ fontFamily: "var(--font-sora)" }}>
                        {agent.name}
                      </h4>
                      <p className="text-xs text-zinc-400 leading-snug">
                        {agent.role}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 flex items-center justify-between text-[11px]"
                      style={{ borderTop: "1px solid rgba(255, 255, 255, 0.04)" }}>
                      <span className="text-emerald-400 font-mono text-[10px]">Active</span>
                      <span className="text-zinc-500 text-[10px]">Groq Fast API</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 4: Synergy Bottom Banner (Spans full width) */}
          <div
            className="reveal md:col-span-2 lg:col-span-12 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 group relative overflow-hidden cursor-default transition-all duration-500 hover:border-[rgba(224,120,80,0.25)]"
            style={{
              background: "linear-gradient(135deg, rgba(224, 120, 80, 0.12), rgba(200, 160, 112, 0.06))",
              border: "1px solid rgba(224, 120, 80, 0.18)",
            }}
          >
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
              <div>
                <p className="text-sm sm:text-base font-semibold mb-1" style={{ color: "#e07850", fontFamily: "var(--font-sora)" }}>
                  All three work together seamlessly
                </p>
                <p className="text-xs sm:text-sm" style={{ color: "rgba(184, 176, 168, 0.85)" }}>
                  Weather triggers demand forecasts. Competitors inform baseline strategy. AI agents synthesize the daily briefing.
                </p>
              </div>
              <Link href="#how-it-works" className="inline-flex items-center gap-2 group/link cursor-pointer px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-all duration-300">
                <span className="text-xs font-semibold" style={{ color: "#f5dcc8", fontFamily: "var(--font-jetbrains-mono)" }}>
                  See how it works
                </span>
                <svg className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: "#e07850" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
