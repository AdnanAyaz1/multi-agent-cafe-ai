"use client";

import { FEATURES } from "@/constants/landing";
import { motion } from "framer-motion";

const iconMap = {
  weather: (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  ),
  competitor: (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  agents: (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
    </svg>
  ),
} as const;

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-12 gradient-bg" />
            <p className="text-[11px] text-[#00d2ff] uppercase tracking-[0.2em] font-semibold" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>Features</p>
          </div>
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-montserrat)" }}>
            Everything you need to <span className="gradient-text">stay ahead</span>
          </h2>
          <p className="text-[#859399] text-lg max-w-xl">
            Three powerful modules working together to give your cafe an unfair advantage.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Large card - spans 2 cols */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-2 glass-card card-glow rounded-3xl p-8 lg:p-10 group relative"
          >
            {/* Subtle radial gradient accents - appear on hover */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_top_right,rgba(0,210,255,0.06)_0%,transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[radial-gradient(ellipse_at_bottom_left,rgba(31,225,158,0.04)_0%,transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/30 group-hover:scale-105 transition-all duration-500">
                  {iconMap.weather}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-montserrat)" }}>{FEATURES[0].title}</h3>
                  <p className="text-[#859399] text-sm">Real-time weather analysis</p>
                </div>
              </div>

              <p className="text-[#859399] leading-relaxed text-sm mb-8 max-w-lg">{FEATURES[0].description}</p>

              {/* Mock UI inside the card */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: "☀️", label: "Sunny 32°C", action: "Push iced drinks", lift: "+18%" },
                  { icon: "🌧️", label: "Rainy 14°C", action: "Push hot specials", lift: "+12%" },
                  { icon: "❄️", label: "Cold 5°C", action: "Warm combos", lift: "+9%" },
                  { icon: "🌤️", label: "Mild 22°C", action: "Outdoor seating", lift: "+15%" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.05] hover:border-white/[0.08] transition-all duration-300">
                    <span className="text-xl">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-[12px] font-medium truncate">{item.label}</p>
                      <p className="text-[#859399] text-[10px] truncate">{item.action}</p>
                    </div>
                    <span className="text-[10px] text-[#1fe19e] font-bold" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>{item.lift}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Two stacked cards */}
          <div className="flex flex-col gap-5">
            {FEATURES.slice(1).map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: 0.15 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                className="glass-card card-glow rounded-3xl p-7 group relative flex-1"
              >
                {/* Subtle corner gradient - hover activated */}
                <div className={`absolute top-0 right-0 w-[200px] h-[200px] bg-[radial-gradient(ellipse_at_top_right,${i === 0 ? "rgba(139,92,246,0.06)" : "rgba(0,210,255,0.06)"}_0%,transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`} />

                <div className="relative z-10">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white mb-5 shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-500`}>
                    {iconMap[feature.icon]}
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: "var(--font-montserrat)" }}>{feature.title}</h3>
                  <p className="text-[#859399] leading-relaxed text-sm">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
