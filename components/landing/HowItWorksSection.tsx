"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const steps = [
  {
    number: "01",
    title: "Connect your cafe",
    description: "Sign up, add your menu, and tell us about your competitors. Takes under 5 minutes.",
    accent: "#e07850",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.015A3.001 3.001 0 0021 9.349" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "AI analyzes everything",
    description: "Weather data, competitor prices, and your menu are processed by 5 specialized AI agents.",
    accent: "#c8a070",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Get daily recommendations",
    description: "Wake up to a briefing on what to promote, discount, or hold — with full reasoning.",
    accent: "#e07850",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
      </svg>
    ),
  },
  {
    number: "04",
    title: "Approve or adjust",
    description: "Small changes auto-approve. Big moves go to your review queue. You're always in control.",
    accent: "#c8a070",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export function HowItWorksSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 80%", "end 20%"],
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

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

        {/* Animated timeline */}
        <div ref={containerRef} className="relative max-w-5xl">
          {/* Animated vertical line */}
          <div className="hidden lg:block absolute left-[60px] top-0 bottom-0 w-px"
            style={{ background: "rgba(224, 120, 80, 0.06)" }}>
            <motion.div
              className="w-full origin-top"
              style={{
                height: "100%",
                background: "linear-gradient(to bottom, rgba(224,120,80,0.3), rgba(200,160,112,0.15))",
                scaleY: lineHeight,
              }}
            />
          </div>

          <div className="space-y-8 lg:space-y-0">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: -40, filter: "blur(6px)" }}
                whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="relative flex gap-6 lg:gap-14 group lg:pb-16"
              >
                {/* Pulsing node on the line */}
                <div className="flex-shrink-0 relative">
                  {/* Outer glow ring */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-700"
                    style={{ boxShadow: `0 0 50px -12px ${step.accent}25`, transform: "scale(1.1)" }} />

                  {/* Number box */}
                  <div className="w-[120px] h-[120px] rounded-2xl flex flex-col items-center justify-center gap-2 transition-all duration-500 group-hover:scale-105 relative"
                    style={{
                      background: `linear-gradient(135deg, ${step.accent}08, ${step.accent}03)`,
                      border: `1px solid ${step.accent}12`,
                    }}
                  >
                    <span className="text-3xl font-extrabold" style={{ fontFamily: "var(--font-sora)", color: `${step.accent}40` }}>
                      {step.number}
                    </span>
                    <div style={{ color: `${step.accent}60` }}>
                      {step.icon}
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
                      background: "linear-gradient(160deg, rgba(20, 18, 16, 0.6), rgba(14, 12, 10, 0.3))",
                      border: "1px solid rgba(255, 255, 255, 0.03)",
                    }}
                  >
                    {/* Shimmer on hover */}
                    <div className="absolute inset-0 rounded-2xl -translate-x-full group-hover:translate-x-full transition-transform duration-[1s] ease-in-out pointer-events-none"
                      style={{ background: `linear-gradient(90deg, transparent, ${step.accent}04, transparent)` }} />

                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3"
                      style={{ fontFamily: "var(--font-jetbrains-mono)", color: `${step.accent}80` }}>
                      Step {step.number}
                    </p>
                    <h3 className="text-xl lg:text-2xl font-bold text-white mb-3 tracking-tight group-hover:text-[#f5dcc8] transition-colors duration-500"
                      style={{ fontFamily: "var(--font-sora)" }}>
                      {step.title}
                    </h3>
                    <p className="text-sm lg:text-[15px] leading-relaxed max-w-lg"
                      style={{ color: "rgba(160, 152, 144, 0.65)" }}>
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
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
