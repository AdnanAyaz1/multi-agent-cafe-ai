import { HOW_IT_WORKS_STEPS } from "@/constants/steps";
import { HOW_IT_WORKS_STEP_ICONS } from "@/constants/icons";

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-16 sm:py-24 lg:py-40 relative">
      <div className="section-divider absolute top-0 left-0 w-full" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="reveal mb-12 sm:mb-20 lg:mb-28">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="h-px w-8 sm:w-10" style={{ background: "linear-gradient(90deg, transparent, rgba(224, 120, 80, 0.3))" }} />
            <p className="text-[10px] uppercase tracking-[0.3em] font-semibold"
              style={{ fontFamily: "var(--font-jetbrains-mono)", color: "#e07850" }}>
              How it works
            </p>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[56px] xl:text-[64px] font-bold text-white mb-4 sm:mb-6 leading-[1.1] sm:leading-[1.05] tracking-tight"
            style={{ fontFamily: "var(--font-sora)" }}>
            From sign-up to daily briefings
          </h2>
          <p className="text-base sm:text-lg max-w-xl leading-relaxed"
            style={{ color: "rgba(184, 176, 168, 0.9)" }}>
            Four simple steps to AI-powered cafe management.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative max-w-5xl">
          {/* Vertical line for desktop */}
          <div className="hidden lg:block absolute left-[60px] top-0 bottom-0 w-px"
            style={{ background: "rgba(224, 120, 80, 0.12)" }}>
            <div className="w-full h-full origin-top"
              style={{
                background: "linear-gradient(to bottom, rgba(224,120,80,0.3), rgba(200,160,112,0.15))",
                animation: "grow-line 2s ease-out forwards",
              }} />
          </div>

          {/* Vertical line for tablet */}
          <div className="hidden sm:block lg:hidden absolute left-[36px] top-0 bottom-0 w-px"
            style={{ background: "rgba(224, 120, 80, 0.12)" }} />

          <style>{`
            @keyframes grow-line {
              from { transform: scaleY(0); }
              to { transform: scaleY(1); }
            }
          `}</style>

          <div className="space-y-6 sm:space-y-8 lg:space-y-0">
            {HOW_IT_WORKS_STEPS.map((step, i) => (
              <div
                key={step.number}
                className={`reveal-up relative flex items-start gap-3.5 sm:gap-6 lg:gap-14 group lg:pb-16 reveal-delay-${i + 1}`}
              >
                {/* Number box - responsive size */}
                <div className="flex-shrink-0 relative">
                  <div className="w-12 h-12 sm:w-20 sm:h-20 lg:w-[120px] lg:h-[120px] rounded-xl sm:rounded-2xl flex flex-col items-center justify-center gap-1 sm:gap-2 transition-all duration-500 group-hover:scale-105 relative"
                    style={{
                      background: `linear-gradient(135deg, ${step.accent}14, ${step.accent}06)`,
                      border: `1px solid ${step.accent}22`,
                    }}
                  >
                    <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold" style={{ fontFamily: "var(--font-sora)", color: `${step.accent}90` }}>
                      {step.number}
                    </span>
                    <div className="hidden sm:block" style={{ color: `${step.accent}80` }}>
                      {HOW_IT_WORKS_STEP_ICONS[i]}
                    </div>

                    {/* Pulse ring */}
                    <div className="absolute -right-1 -top-1 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute inset-0 rounded-full animate-ping" style={{ background: step.accent, opacity: 0.3 }} />
                      <div className="absolute inset-0.5 rounded-full" style={{ background: step.accent }} />
                    </div>
                  </div>
                </div>

                {/* Content card */}
                <div className="flex-1 min-w-0 sm:pt-2">
                  <div className="rounded-2xl p-4 sm:p-6 lg:p-8 transition-all duration-500 group-hover:translate-x-1"
                    style={{
                      background: "linear-gradient(160deg, rgba(30, 27, 24, 0.8), rgba(20, 18, 16, 0.5))",
                      border: "1px solid rgba(255, 255, 255, 0.06)",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em]"
                        style={{ fontFamily: "var(--font-jetbrains-mono)", color: `${step.accent}` }}>
                        Step {step.number}
                      </p>
                      <div className="sm:hidden" style={{ color: `${step.accent}90` }}>
                        {HOW_IT_WORKS_STEP_ICONS[i]}
                      </div>
                    </div>
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-2 sm:mb-3 tracking-tight group-hover:text-[#f5dcc8] transition-colors duration-500"
                      style={{ fontFamily: "var(--font-sora)" }}>
                      {step.title}
                    </h3>
                    <p className="text-xs sm:text-sm lg:text-[15px] leading-relaxed max-w-lg"
                      style={{ color: "rgba(184, 176, 168, 0.85)" }}>
                      {step.description}
                    </p>

                    {/* Accent line that grows on hover */}
                    <div className="mt-4 sm:mt-5 h-px w-0 group-hover:w-20 transition-all duration-700"
                      style={{ background: `linear-gradient(90deg, ${step.accent}40, transparent)` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
