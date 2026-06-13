"use client";

import { STATS } from "@/constants/landing";
import { motion } from "framer-motion";
import { CountingNumber } from "./CountingNumber";

export function StatsSection() {
  return (
    <section className="py-12 lg:py-16">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Horizontal strip — NOT a grid of boxes */}
          <div className="glass-card rounded-2xl px-8 py-6 lg:px-12 lg:py-8">
            <div className="flex items-center justify-between flex-wrap gap-6">
              {STATS.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="flex items-center gap-4 group"
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
                      style={{ fontFamily: "var(--font-jetbrains-mono)", color: "rgba(160, 152, 144, 0.6)" }}>
                      {stat.label}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
