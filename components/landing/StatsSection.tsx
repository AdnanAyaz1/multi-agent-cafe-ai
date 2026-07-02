import { STATS } from "@/constants/landing";
import { CountingNumber } from "./CountingNumber";

export function StatsSection() {
  return (
    <section className="py-12 lg:py-16">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="reveal">
          {/* Horizontal strip — NOT a grid of boxes */}
          <div className="glass-card rounded-2xl px-8 py-6 lg:px-12 lg:py-8">
            <div className="flex items-center justify-between flex-wrap gap-6">
              {STATS.map((stat, i) => (
                <div
                  key={stat.label}
                  className={`reveal-up flex items-center gap-4 group reveal-delay-${i + 1}`}
                >
                  {i > 0 && (
                    <div className="hidden sm:block w-px h-8 mr-4"
                      style={{ background: "rgba(224, 120, 80, 0.08)" }} />
                  )}
                  <div>
                    <div className="text-2xl lg:text-4xl font-extrabold text-white tracking-tight"
                      style={{ fontFamily: "var(--font-sora)" }}>
                      <CountingNumber target={stat.value} suffix={stat.suffix} duration={2} delay={0.2 + i * 0.15} />
                    </div>
                    <div className="text-[9px] uppercase tracking-[0.25em] mt-1"
                      style={{ fontFamily: "var(--font-jetbrains-mono)", color: "rgba(184, 176, 168, 0.8)" }}>
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
