import { HOW_IT_WORKS_STEPS } from "@/constants/steps";
import { HOW_IT_WORKS_STEP_ICONS } from "@/constants/icons";

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 lg:py-40 relative">
      <div className="section-divider absolute top-0 left-0 w-full" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="reveal mb-20 lg:mb-28">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-10" style={{ background: "linear-gradient(90deg, transparent, rgba(224, 120, 80, 0.3))" }} />
            <p className="text-[10px] uppercase tracking-[0.3em] font-semibold"
              style={{ fontFamily: "var(--font-jetbrains-mono)", color: "#e07850" }}>
              How it works
            </p>
          </div>
          <h2 className="text-4xl lg:text-[64px] font-bold text-white mb-6 leading-[1.05] tracking-tight"
            style={{ fontFamily: "var(--font-sora)" }}>
            From sign-up to daily briefings
          </h2>
          <p className="text-lg max-w-xl leading-relaxed"
            style={{ color: "rgba(184, 176, 168, 0.9)" }}>
            Four simple steps to AI-powered cafe management.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative max-w-5xl">
          {/* Vertical line */}
          <div className="hidden lg:block absolute left-[60px] top-0 bottom-0 w-px"
            style={{ background: "rgba(224, 120, 80, 0.12)" }}>
            <div className="w-full h-full origin-top"
              style={{
                background: "linear-gradient(to bottom, rgba(224,120,80,0.3), rgba(200,160,112,0.15))",
                animation: "grow-line 2s ease-out forwards",
              }} />
          </div>

          <style>{`
            @keyframes grow-line {
              from { transform: scaleY(0); }
              to { transform: scaleY(1); }
            }
          `}</style>

          <div className="space-y-8 lg:space-y-0">
            {HOW_IT_WORKS_STEPS.map((step, i) => (
              <div
                key={step.number}
                className={`reveal-up relative flex gap-6 lg:gap-14 group lg:pb-16 reveal-delay-${i + 1}`}
              >
                {/* Number box */}
                <div className="flex-shrink-0 relative">
                  <div className="w-[120px] h-[120px] rounded-2xl flex flex-col items-center justify-center gap-2 transition-all duration-500 group-hover:scale-105 relative"
                    style={{
                      background: `linear-gradient(135deg, ${step.accent}14, ${step.accent}06)`,
                      border: `1px solid ${step.accent}22`,
                    }}
                  >
                    <span className="text-3xl font-extrabold" style={{ fontFamily: "var(--font-sora)", color: `${step.accent}40` }}>
                      {step.number}
                    </span>
                    <div style={{ color: `${step.accent}60` }}>
                      {HOW_IT_WORKS_STEP_ICONS[i]}
                    </div>

                    {/* Pulse ring */}
                    <div className="absolute -right-1 -top-1 w-3 h-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute inset-0 rounded-full animate-ping" style={{ background: step.accent, opacity: 0.3 }} />
                      <div className="absolute inset-0.5 rounded-full" style={{ background: step.accent }} />
                    </div>
                  </div>
                </div>

                {/* Content card */}
                <div className="flex-1 pt-2">
                  <div className="rounded-2xl p-6 lg:p-8 transition-all duration-500 group-hover:translate-x-1"
                    style={{
                      background: "linear-gradient(160deg, rgba(30, 27, 24, 0.8), rgba(20, 18, 16, 0.5))",
                      border: "1px solid rgba(255, 255, 255, 0.06)",
                    }}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3"
                      style={{ fontFamily: "var(--font-jetbrains-mono)", color: `${step.accent}80` }}>
                      Step {step.number}
                    </p>
                    <h3 className="text-xl lg:text-2xl font-bold text-white mb-3 tracking-tight group-hover:text-[#f5dcc8] transition-colors duration-500"
                      style={{ fontFamily: "var(--font-sora)" }}>
                      {step.title}
                    </h3>
                    <p className="text-sm lg:text-[15px] leading-relaxed max-w-lg"
                      style={{ color: "rgba(184, 176, 168, 0.85)" }}>
                      {step.description}
                    </p>

                    {/* Accent line that grows on hover */}
                    <div className="mt-5 h-px w-0 group-hover:w-20 transition-all duration-700"
                      style={{ background: `linear-gradient(90deg, ${step.accent}40, transparent)` }} />
                  </div>
                </div>

                {/* Floating accent dot */}
                <div className="hidden lg:block absolute right-0 top-10 w-1.5 h-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700"
                  style={{ background: step.accent, boxShadow: `0 0 12px 2px ${step.accent}30` }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
