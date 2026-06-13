"use client";

import { FEATURES } from "@/constants/landing";
import { motion } from "framer-motion";

const iconMap = {
  weather: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  ),
  competitor: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  agents: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
    </svg>
  ),
} as const;

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 lg:py-40 relative">
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
              Features
            </p>
          </div>
          <h2 className="text-4xl lg:text-[64px] font-bold text-white mb-6 leading-[1.05] tracking-tight"
            style={{ fontFamily: "var(--font-sora)" }}>
            Everything you need to <span className="gradient-text">stay ahead</span>
          </h2>
          <p className="text-lg max-w-xl leading-relaxed"
            style={{ color: "rgba(160, 152, 144, 0.7)" }}>
            Three powerful modules working together to give your cafe an unfair advantage.
          </p>
        </motion.div>

        {/* Asymmetric bento grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-5">
          {/* Large feature — spans 3 cols */}
          <motion.div
            initial={{ opacity: 0, y: 40, filter: "blur(4px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-3 rounded-3xl p-8 lg:p-10 group relative overflow-hidden cursor-default"
            style={{
              background: "linear-gradient(160deg, rgba(20, 18, 16, 0.8), rgba(14, 12, 10, 0.6))",
              border: "1px solid rgba(224, 120, 80, 0.06)",
              backdropFilter: "blur(20px)",
            }}
          >
            {/* Hover glow orb */}
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-all duration-1000 pointer-events-none"
              style={{ background: "rgba(224, 120, 80, 0.06)" }} />
            {/* Hover border glow */}
            <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
              style={{
                background: "linear-gradient(135deg, rgba(224, 120, 80, 0.08), transparent 40%, transparent 60%, rgba(200, 160, 112, 0.04))",
                mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                maskComposite: "exclude",
                WebkitMaskComposite: "xor",
                padding: "1px",
              }}
            />
            {/* Shimmer sweep */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[1.2s] ease-in-out pointer-events-none"
              style={{ background: "linear-gradient(90deg, transparent, rgba(224, 120, 80, 0.03), transparent)" }} />

            <div className="relative z-10">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:shadow-[0_0_24px_-4px_rgba(224,120,80,0.25)] transition-all duration-500"
                  style={{ background: "rgba(224, 120, 80, 0.08)", border: "1px solid rgba(224, 120, 80, 0.12)", color: "#e07850" }}>
                  {iconMap.weather}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl lg:text-2xl font-bold text-white mb-3 tracking-tight group-hover:text-[#f5dcc8] transition-colors duration-500"
                    style={{ fontFamily: "var(--font-sora)" }}>{FEATURES[0].title}</h3>
                  <p className="leading-relaxed text-sm lg:text-[15px]"
                    style={{ color: "rgba(160, 152, 144, 0.65)" }}>{FEATURES[0].description}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Smaller feature — spans 2 cols, offset down */}
          <motion.div
            initial={{ opacity: 0, y: 40, filter: "blur(4px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-2 rounded-3xl p-8 lg:p-10 group relative overflow-hidden lg:mt-12 cursor-default"
            style={{
              background: "linear-gradient(160deg, rgba(20, 18, 16, 0.8), rgba(14, 12, 10, 0.6))",
              border: "1px solid rgba(200, 160, 112, 0.06)",
              backdropFilter: "blur(20px)",
            }}
          >
            <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-all duration-1000 pointer-events-none"
              style={{ background: "rgba(200, 160, 112, 0.06)" }} />
            <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
              style={{
                background: "linear-gradient(135deg, rgba(200, 160, 112, 0.08), transparent 40%, transparent 60%, rgba(224, 120, 80, 0.04))",
                mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                maskComposite: "exclude",
                WebkitMaskComposite: "xor",
                padding: "1px",
              }}
            />
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[1.2s] ease-in-out pointer-events-none"
              style={{ background: "linear-gradient(90deg, transparent, rgba(200, 160, 112, 0.03), transparent)" }} />

            <div className="relative z-10">
              <div className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:shadow-[0_0_24px_-4px_rgba(200,160,112,0.25)] transition-all duration-500"
                style={{ background: "rgba(200, 160, 112, 0.08)", border: "1px solid rgba(200, 160, 112, 0.12)", color: "#c8a070" }}>
                {iconMap.competitor}
              </div>
              <h3 className="text-xl font-bold text-white mb-3 tracking-tight group-hover:text-[#f5dcc8] transition-colors duration-500"
                style={{ fontFamily: "var(--font-sora)" }}>{FEATURES[1].title}</h3>
              <p className="leading-relaxed text-sm"
                style={{ color: "rgba(160, 152, 144, 0.65)" }}>{FEATURES[1].description}</p>
            </div>
          </motion.div>

          {/* Third feature — spans 2 cols */}
          <motion.div
            initial={{ opacity: 0, y: 40, filter: "blur(4px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-2 rounded-3xl p-8 lg:p-10 group relative overflow-hidden cursor-default"
            style={{
              background: "linear-gradient(160deg, rgba(20, 18, 16, 0.8), rgba(14, 12, 10, 0.6))",
              border: "1px solid rgba(224, 120, 80, 0.06)",
              backdropFilter: "blur(20px)",
            }}
          >
            <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-all duration-1000 pointer-events-none"
              style={{ background: "rgba(224, 120, 80, 0.05)" }} />
            <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
              style={{
                background: "linear-gradient(135deg, rgba(224, 120, 80, 0.08), transparent 40%, transparent 60%, rgba(200, 160, 112, 0.04))",
                mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                maskComposite: "exclude",
                WebkitMaskComposite: "xor",
                padding: "1px",
              }}
            />
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[1.2s] ease-in-out pointer-events-none"
              style={{ background: "linear-gradient(90deg, transparent, rgba(224, 120, 80, 0.03), transparent)" }} />

            <div className="relative z-10">
              <div className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:shadow-[0_0_24px_-4px_rgba(224,120,80,0.25)] transition-all duration-500"
                style={{ background: "rgba(224, 120, 80, 0.08)", border: "1px solid rgba(224, 120, 80, 0.12)", color: "#e07850" }}>
                {iconMap.agents}
              </div>
              <h3 className="text-xl font-bold text-white mb-3 tracking-tight group-hover:text-[#f5dcc8] transition-colors duration-500"
                style={{ fontFamily: "var(--font-sora)" }}>{FEATURES[2].title}</h3>
              <p className="leading-relaxed text-sm"
                style={{ color: "rgba(160, 152, 144, 0.65)" }}>{FEATURES[2].description}</p>
            </div>
          </motion.div>

          {/* Bottom banner — full width */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5 rounded-3xl p-8 lg:p-10 group relative overflow-hidden cursor-default"
            style={{
              background: "linear-gradient(135deg, rgba(224, 120, 80, 0.06), rgba(200, 160, 112, 0.03))",
              border: "1px solid rgba(224, 120, 80, 0.06)",
            }}
          >
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[1.2s] ease-in-out pointer-events-none"
              style={{ background: "linear-gradient(90deg, transparent, rgba(224, 120, 80, 0.02), transparent)" }} />
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <p className="text-sm font-semibold mb-1" style={{ color: "#e07850", fontFamily: "var(--font-sora)" }}>
                  All three work together
                </p>
                <p className="text-sm" style={{ color: "rgba(160, 152, 144, 0.6)" }}>
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
          </motion.div>
        </div>
      </div>
    </section>
  );
}
