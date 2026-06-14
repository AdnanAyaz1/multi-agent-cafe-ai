"use client";

import { motion } from "framer-motion";
import { CountingNumber } from "./CountingNumber";
import { STATS } from "@/constants/landing";

export function StatsBar() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1, ease: [0.22, 1, 0.36, 1] }}
      className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 w-full"
    >
      {STATS.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: 1.1 + index * 0.1,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="flex flex-col items-center"
        >
          <span className="text-3xl md:text-4xl font-extrabold gradient-text" style={{ fontFamily: "var(--font-montserrat)" }}>
            <CountingNumber
              target={stat.value}
              suffix={stat.suffix}
              duration={2.5}
              delay={1.2 + index * 0.15}
            />
          </span>
          <span className="text-[11px] text-[#a09890] uppercase tracking-widest mt-2" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
            {stat.label}
          </span>
        </motion.div>
      ))}
    </motion.div>
  );
}
