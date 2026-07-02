import { FEATURES } from "@/constants/landing";
import { FEATURE_ICONS } from "@/constants/icons";

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 lg:py-40 relative">
      <div className="section-divider absolute top-0 left-0 w-full" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="reveal mb-20 lg:mb-28">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-10" style={{ background: "linear-gradient(90deg, transparent, rgba(224, 120, 80, 0.3))" }} />
            <p className="text-[10px] uppercase tracking-[0.3em] font-semibold"
              style={{ fontFamily: "var(--font-jetbrains-mono)", color: "#e07850" }}>
              Features
            </p>
          </div>
          <h2 className="text-4xl lg:text-[64px] font-bold text-white mb-6 leading-[1.05] tracking-tight"
            style={{ fontFamily: "var(--font-sora)" }}>
            Everything you need to <span className="gradient-text">stay ahead</span>
          </h2>
          <p className="text-lg max-w-xl leading-relaxed"
            style={{ color: "rgba(184, 176, 168, 0.9)" }}>
            Three powerful modules working together to give your cafe an unfair advantage.
          </p>
        </div>

        {/* Asymmetric bento grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-5">
          {/* Large feature — spans 3 cols */}
          <div
            className="reveal-scale lg:col-span-3 rounded-3xl p-8 lg:p-10 group relative overflow-hidden cursor-default transition-all duration-500 hover:border-[rgba(224,120,80,0.12)]"
            style={{
              background: "linear-gradient(160deg, rgba(30, 27, 24, 0.95), rgba(20, 18, 16, 0.9))",
              border: "1px solid rgba(224, 120, 80, 0.15)",
            }}
          >
            {/* Hover glow orb */}
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-all duration-1000 pointer-events-none"
              style={{ background: "rgba(224, 120, 80, 0.06)" }} />

            <div className="relative z-10">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:shadow-[0_0_24px_-4px_rgba(224,120,80,0.25)] transition-all duration-500"
                  style={{ background: "rgba(224, 120, 80, 0.08)", border: "1px solid rgba(224, 120, 80, 0.12)", color: "#e07850" }}>
                  {FEATURE_ICONS.weather}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl lg:text-2xl font-bold text-white mb-3 tracking-tight group-hover:text-[#f5dcc8] transition-colors duration-500"
                    style={{ fontFamily: "var(--font-sora)" }}>{FEATURES[0].title}</h3>
                  <p className="leading-relaxed text-sm lg:text-[15px]"
                    style={{ color: "rgba(184, 176, 168, 0.85)" }}>{FEATURES[0].description}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Smaller feature — spans 2 cols, offset down */}
          <div
            className="reveal-scale lg:col-span-2 rounded-3xl p-8 lg:p-10 group relative overflow-hidden lg:mt-12 cursor-default transition-all duration-500 hover:border-[rgba(200,160,112,0.12)]"
            style={{
              background: "linear-gradient(160deg, rgba(30, 27, 24, 0.95), rgba(20, 18, 16, 0.9))",
              border: "1px solid rgba(200, 160, 112, 0.15)",
            }}
          >
            <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-all duration-1000 pointer-events-none"
              style={{ background: "rgba(200, 160, 112, 0.06)" }} />

            <div className="relative z-10">
              <div className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:shadow-[0_0_24px_-4px_rgba(200,160,112,0.25)] transition-all duration-500"
                style={{ background: "rgba(200, 160, 112, 0.08)", border: "1px solid rgba(200, 160, 112, 0.12)", color: "#c8a070" }}>
                {FEATURE_ICONS.competitor}
              </div>
              <h3 className="text-xl font-bold text-white mb-3 tracking-tight group-hover:text-[#f5dcc8] transition-colors duration-500"
                style={{ fontFamily: "var(--font-sora)" }}>{FEATURES[1].title}</h3>
              <p className="leading-relaxed text-sm"
                style={{ color: "rgba(184, 176, 168, 0.85)" }}>{FEATURES[1].description}</p>
            </div>
          </div>

          {/* Third feature — spans 2 cols */}
          <div
            className="reveal-scale lg:col-span-2 rounded-3xl p-8 lg:p-10 group relative overflow-hidden cursor-default transition-all duration-500 hover:border-[rgba(224,120,80,0.12)]"
            style={{
              background: "linear-gradient(160deg, rgba(30, 27, 24, 0.95), rgba(20, 18, 16, 0.9))",
              border: "1px solid rgba(224, 120, 80, 0.15)",
            }}
          >
            <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-all duration-1000 pointer-events-none"
              style={{ background: "rgba(224, 120, 80, 0.05)" }} />

            <div className="relative z-10">
              <div className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:shadow-[0_0_24px_-4px_rgba(224,120,80,0.25)] transition-all duration-500"
                style={{ background: "rgba(224, 120, 80, 0.08)", border: "1px solid rgba(224, 120, 80, 0.12)", color: "#e07850" }}>
                {FEATURE_ICONS.agents}
              </div>
              <h3 className="text-xl font-bold text-white mb-3 tracking-tight group-hover:text-[#f5dcc8] transition-colors duration-500"
                style={{ fontFamily: "var(--font-sora)" }}>{FEATURES[2].title}</h3>
              <p className="leading-relaxed text-sm"
                style={{ color: "rgba(184, 176, 168, 0.85)" }}>{FEATURES[2].description}</p>
            </div>
          </div>

          {/* Bottom banner — full width */}
          <div
            className="reveal lg:col-span-5 rounded-3xl p-8 lg:p-10 group relative overflow-hidden cursor-default transition-all duration-500 hover:border-[rgba(224,120,80,0.1)]"
            style={{
              background: "linear-gradient(135deg, rgba(224, 120, 80, 0.1), rgba(200, 160, 112, 0.06))",
              border: "1px solid rgba(224, 120, 80, 0.12)",
            }}
          >
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <p className="text-sm font-semibold mb-1" style={{ color: "#e07850", fontFamily: "var(--font-sora)" }}>
                  All three work together
                </p>
                <p className="text-sm" style={{ color: "rgba(184, 176, 168, 0.8)" }}>
                  Weather triggers pricing. Competitors inform strategy. AI agents execute the plan — daily.
                </p>
              </div>
              <div className="flex items-center gap-2 group/link cursor-pointer">
                <span className="text-xs font-medium" style={{ color: "rgba(224, 120, 80, 0.7)", fontFamily: "var(--font-jetbrains-mono)" }}>
                  See how
                </span>
                <svg className="w-3 h-3 group-hover/link:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: "rgba(224, 120, 80, 0.4)" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
