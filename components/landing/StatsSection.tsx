import { STATS } from "@/constants/landing";
import { CountingNumber } from "./CountingNumber";

export function StatsSection() {
  return (
    <section className="py-8 sm:py-12 lg:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="reveal">
          <div className="glass-card rounded-2xl px-5 py-6 sm:px-8 lg:px-12 lg:py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 items-center">
              {STATS.map((stat, i) => (
                <div
                  key={stat.label}
                  className={`reveal-up flex items-center gap-3 sm:gap-4 group reveal-delay-${i + 1} relative`}
                >
                  {i > 0 && (
                    <div className="hidden md:block absolute -left-4 lg:-left-6 top-1/2 -translate-y-1/2 w-px h-8"
                      style={{ background: "rgba(224, 120, 80, 0.12)" }} />
                  )}
                  <div>
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight"
                      style={{ fontFamily: "var(--font-sora)" }}>
                      <CountingNumber target={stat.value} suffix={stat.suffix} duration={2} delay={0.2 + i * 0.15} />
                    </div>
                    <div className="text-[9px] sm:text-[10px] uppercase tracking-[0.18em] sm:tracking-[0.25em] mt-1"
                      style={{ fontFamily: "var(--font-jetbrains-mono)", color: "rgba(184, 176, 168, 0.85)" }}>
                      {stat.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
