"use client";

import { STATS } from "@/constants/landing";
import { motion } from "framer-motion";
import { CountingNumber } from "./CountingNumber";

export function StatsSection() {
  return (
    <section className="py-12 lg:py-16">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative glass-card rounded-3xl p-8 lg:p-10 overflow-hidden group"
        >
          {/* Animated gradient wash */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#00d2ff]/[0.03] via-transparent to-[#1fe19e]/[0.03] pointer-events-none" />
          {/* Corner glow accents */}
          <div className="absolute -top-20 -left-20 w-60 h-60 bg-[radial-gradient(ellipse,rgba(0,210,255,0.06)_0%,transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-[radial-gradient(ellipse,rgba(31,225,158,0.06)_0%,transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

          <div className="relative grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="text-center relative"
              >
                {/* Glowing separator */}
                {i > 0 && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 hidden md:block">
                    <div className="w-px h-10 bg-gradient-to-b from-transparent via-[#00d2ff]/15 to-transparent" />
                  </div>
                )}

                <div
                  className="text-3xl lg:text-4xl font-extrabold gradient-text mb-2"
                  style={{ fontFamily: "var(--font-montserrat)" }}
                >
                  <CountingNumber target={stat.value} suffix={stat.suffix} duration={2} delay={0.2 + i * 0.15} />
                </div>
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#859399]" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
