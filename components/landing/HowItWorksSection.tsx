"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { HOW_IT_WORKS_STEPS } from "@/constants/steps";
import { HOW_IT_WORKS_STEP_ICONS } from "@/constants/icons";

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
            style={{ color: "rgba(184, 176, 168, 0.9)" }}>
            Four simple steps to AI-powered cafe management.
          </p>
        </motion.div>

        {/* Animated timeline */}
        <div ref={containerRef} className="relative max-w-5xl">
          {/* Animated vertical line */}
          <div className="hidden lg:block absolute left-[60px] top-0 bottom-0 w-px"
            style={{ background: "rgba(224, 120, 80, 0.12)" }}>
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
            {HOW_IT_WORKS_STEPS.map((step, i) => (
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
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
