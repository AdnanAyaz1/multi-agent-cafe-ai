"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Connect your cafe",
    description: "Sign up, add your menu, and tell us about your competitors. Takes under 5 minutes.",
    accent: "#e07850",
  },
  {
    number: "02",
    title: "AI analyzes everything",
    description: "Weather data, competitor prices, and your menu are processed by 5 specialized AI agents.",
    accent: "#c8a070",
  },
  {
    number: "03",
    title: "Get daily recommendations",
    description: "Wake up to a briefing on what to promote, discount, or hold — with full reasoning.",
    accent: "#e07850",
  },
  {
    number: "04",
    title: "Approve or adjust",
    description: "Small changes auto-approve. Big moves go to your review queue. You're always in control.",
    accent: "#c8a070",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 lg:py-40 relative">
      <div className="section-divider absolute top-0 left-0 w-full" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-20 lg:mb-28"
        >
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
            style={{ color: "rgba(160, 152, 144, 0.7)" }}>
            Four simple steps to AI-powered cafe management.
          </p>
        </motion.div>

        {/* Staggered timeline — NOT boxes in a grid */}
        <div className="relative max-w-5xl">
          {/* Vertical line */}
          <div className="hidden lg:block absolute left-[60px] top-0 bottom-0 w-px"
            style={{ background: "linear-gradient(to bottom, rgba(224,120,80,0.15), rgba(200,160,112,0.08), transparent)" }} />

          <div className="space-y-8 lg:space-y-12">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: -30, filter: "blur(4px)" }}
                whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="flex gap-6 lg:gap-10 group"
              >
                {/* Number node */}
                <div className="flex-shrink-0 relative">
                  <div className="w-[120px] h-[120px] rounded-3xl flex items-center justify-center transition-all duration-500 group-hover:scale-105"
                    style={{
                      background: `linear-gradient(135deg, ${step.accent}08, ${step.accent}04)`,
                      border: `1px solid ${step.accent}10`,
                    }}>
                    <span className="text-4xl font-extrabold" style={{ fontFamily: "var(--font-sora)", color: `${step.accent}30` }}>
                      {step.number}
                    </span>
                  </div>
                  {/* Glow on hover */}
                  <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                    style={{ boxShadow: `0 0 40px -10px ${step.accent}15` }} />
                </div>

                {/* Content */}
                <div className="flex-1 pt-4">
                  <h3 className="text-xl lg:text-2xl font-bold text-white mb-3 tracking-tight"
                    style={{ fontFamily: "var(--font-sora)" }}>
                    {step.title}
                  </h3>
                  <p className="text-sm lg:text-[15px] leading-relaxed max-w-lg"
                    style={{ color: "rgba(160, 152, 144, 0.65)" }}>
                    {step.description}
                  </p>
                  {/* Subtle accent line under content */}
                  <div className="mt-6 h-px w-0 group-hover:w-16 transition-all duration-500"
                    style={{ background: `${step.accent}20` }} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
