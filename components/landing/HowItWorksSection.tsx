"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Connect your cafe",
    description: "Sign up, add your menu, and tell us about your competitors.",
    color: "#00d2ff",
    mockup: (
      <div className="space-y-2 mt-4">
        <div className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.03] border border-white/[0.04]">
          <div className="w-5 h-5 rounded bg-[#00d2ff]/15 flex items-center justify-center">
            <svg className="w-3 h-3 text-[#00d2ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          </div>
          <span className="text-[10px] text-white/60">Add menu items...</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.03] border border-white/[0.04]">
          <div className="w-5 h-5 rounded bg-[#1fe19e]/15 flex items-center justify-center">
            <svg className="w-3 h-3 text-[#1fe19e]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <span className="text-[10px] text-white/60">3 competitors added</span>
        </div>
      </div>
    ),
  },
  {
    number: "02",
    title: "AI analyzes everything",
    description: "Weather data, competitor prices, and your menu are processed by 5 specialized AI agents.",
    color: "#1fe19e",
    mockup: (
      <div className="mt-4">
        <div className="flex items-center gap-1.5 flex-wrap mb-3">
          {["Menu Analyst", "Weather AI", "Strategist", "Critic", "Synthesizer"].map((agent) => (
            <span key={agent} className="text-[9px] px-2 py-1 rounded-full border border-white/[0.08] text-white/50 bg-white/[0.02]" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
              {agent}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-1 flex-1 rounded-full bg-white/[0.05] overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#00d2ff] to-[#1fe19e] rounded-full"
              initial={{ width: "0%" }}
              whileInView={{ width: "100%" }}
              viewport={{ once: true }}
              transition={{ duration: 2, ease: "easeOut" }}
            />
          </div>
          <span className="text-[9px] text-[#1fe19e]" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>done</span>
        </div>
      </div>
    ),
  },
  {
    number: "03",
    title: "Get daily recommendations",
    description: "Wake up to a briefing on what to promote, discount, or hold — with full reasoning.",
    color: "#ffd79f",
    mockup: (
      <div className="space-y-1.5 mt-4">
        {[
          { text: "Raise iced latte price", tag: "+18%", tagColor: "text-[#1fe19e]" },
          { text: "Promote cold brew", tag: "COMP", tagColor: "text-[#00d2ff]" },
          { text: "Bundle pastry + tea", tag: "+9%", tagColor: "text-[#1fe19e]" },
        ].map((item) => (
          <div key={item.text} className="flex items-center justify-between p-1.5 rounded bg-white/[0.02] border border-white/[0.03]">
            <span className="text-[10px] text-white/50">{item.text}</span>
            <span className={`text-[9px] font-bold ${item.tagColor}`} style={{ fontFamily: "var(--font-jetbrains-mono)" }}>{item.tag}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    number: "04",
    title: "Approve or adjust",
    description: "Small changes auto-approve. Big moves go to your review queue. You're always in control.",
    color: "#00d2ff",
    mockup: (
      <div className="flex items-center gap-3 mt-4">
        <div className="flex-1 p-2 rounded-lg bg-[#1fe19e]/5 border border-[#1fe19e]/10 text-center">
          <div className="text-[10px] text-[#1fe19e] font-bold" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>6</div>
          <div className="text-[8px] text-white/40">Auto-approved</div>
        </div>
        <div className="flex-1 p-2 rounded-lg bg-[#00d2ff]/5 border border-[#00d2ff]/10 text-center">
          <div className="text-[10px] text-[#00d2ff] font-bold" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>2</div>
          <div className="text-[8px] text-white/40">In review</div>
        </div>
      </div>
    ),
  },
];

function TimelineDot({ color, index }: { color: string; index: number }) {
  const dotRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={dotRef} className="absolute left-[27px] md:left-1/2 -translate-x-1/2 z-10">
      {/* Outer pulse ring — infinite loop */}
      <div
        className="absolute inset-0 rounded-full animate-ping"
        style={{
          border: `1px solid ${color}`,
          animationDuration: "2s",
          animationDelay: `${index * 0.5}s`,
        }}
      />
      {/* Glowing background */}
      <div
        className="absolute -inset-2 rounded-full blur-md"
        style={{ background: `${color}25` }}
      />
      {/* Dot body */}
      <div
        className="relative w-[14px] h-[14px] rounded-full border-2"
        style={{ borderColor: color, background: `${color}30` }}
      >
        <div className="absolute inset-[3px] rounded-full" style={{ background: color }} />
      </div>
    </div>
  );
}

export function HowItWorksSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start center", "end center"],
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section id="how-it-works" className="py-20 lg:py-32" ref={sectionRef}>
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-20"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-12 gradient-bg" />
            <p className="text-[11px] text-[#00d2ff] uppercase tracking-[0.2em] font-semibold" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>How it works</p>
          </div>
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-montserrat)" }}>
            From sign-up to daily briefings
          </h2>
          <p className="text-[#859399] text-lg max-w-xl">
            Four simple steps to AI-powered cafe management.
          </p>
        </motion.div>

        {/* Timeline */}
        <div ref={timelineRef} className="relative">
          {/* Track (static gray line) */}
          <div className="absolute left-[27px] md:left-1/2 top-0 bottom-0 w-px md:-translate-x-px bg-white/[0.04]" />

          {/* Progress line — linked to scroll */}
          <motion.div
            className="absolute left-[27px] md:left-1/2 top-0 bottom-0 w-px md:-translate-x-px origin-top"
            style={{ height: lineHeight }}
          >
            <div className="w-full h-full bg-gradient-to-b from-[#00d2ff] via-[#1fe19e] to-[#00d2ff]" />
            {/* Glowing tip */}
            <motion.div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
              style={{
                background: "#00d2ff",
                boxShadow: "0 0 12px #00d2ff, 0 0 24px #00d2ff60",
              }}
            />
          </motion.div>

          <div className="space-y-16 md:space-y-24">
            {steps.map((step, i) => {
              const isRight = i % 2 === 1;
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className={`relative flex items-start gap-8 md:gap-0 ${isRight ? "md:flex-row-reverse" : ""}`}
                >
                  {/* Timeline dot */}
                  <TimelineDot color={step.color} index={i} />

                  {/* Content card */}
                  <div className={`flex-1 pl-16 md:pl-0 ${isRight ? "md:pr-16" : "md:pl-16"}`}>
                    <div className={`glass-card card-glow rounded-3xl p-7 group relative overflow-hidden ${isRight ? "md:ml-auto" : ""} max-w-lg`}>
                      {/* Corner glow */}
                      <div
                        className="absolute top-0 w-[200px] h-[200px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                        style={{
                          [isRight ? "left" : "right"]: "-20%",
                          background: `radial-gradient(ellipse at ${isRight ? "top left" : "top right"}, ${step.color}0a 0%, transparent 60%)`,
                        }}
                      />

                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-3">
                          <span
                            className="text-[11px] font-bold tracking-[0.15em] px-2.5 py-1 rounded-md"
                            style={{
                              fontFamily: "var(--font-jetbrains-mono)",
                              color: step.color,
                              background: `${step.color}10`,
                              border: `1px solid ${step.color}15`,
                            }}
                          >
                            STEP {step.number}
                          </span>
                        </div>

                        <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-montserrat)" }}>
                          {step.title}
                        </h3>
                        <p className="text-[#859399] text-sm leading-relaxed">
                          {step.description}
                        </p>

                        {step.mockup}
                      </div>
                    </div>
                  </div>

                  <div className="hidden md:block flex-1" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
