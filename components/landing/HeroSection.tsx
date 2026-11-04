"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { HeroTitle, HeroSubtitle, HeroSearch } from "./HeroReveal";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden animated-gradient-bg noise-overlay">
      {/* Dot grid */}
      <div className="fixed inset-0 dot-grid pointer-events-none z-10 opacity-25" />

      {/* Ambient glow orbs — warm, positioned asymmetrically */}
      <div className="glow-orb w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] aurora-float"
        style={{ background: "rgba(224, 120, 80, 0.05)", top: "20%", left: "-10%", filter: "blur(100px)" }} />
      <div className="glow-orb w-[250px] sm:w-[450px] h-[250px] sm:h-[450px] aurora-float"
        style={{ background: "rgba(200, 160, 112, 0.04)", bottom: "15%", right: "-5%", filter: "blur(90px)", animationDelay: "-5s" }} />
      <div className="glow-orb w-[200px] sm:w-[300px] h-[200px] sm:h-[300px] aurora-float"
        style={{ background: "rgba(245, 220, 200, 0.03)", top: "55%", left: "50%", filter: "blur(80px)", animationDelay: "-9s" }} />

      {/* Subtle grid lines */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="absolute top-0 left-[20%] w-px h-full"
          style={{ background: "linear-gradient(to bottom, transparent, rgba(224, 120, 80, 0.03), transparent)" }} />
        <div className="absolute top-0 right-[20%] w-px h-full"
          style={{ background: "linear-gradient(to bottom, transparent, rgba(224, 120, 80, 0.03), transparent)" }} />
      </div>

      <div className="relative z-20 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 w-full text-center pt-28 pb-16 sm:pt-36 sm:pb-24">
        {/* Status pill */}
        <HeroSearch>
          <motion.div
            initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="inline-flex items-center gap-2.5 sm:gap-3 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full mb-8 sm:mb-12 max-w-full group transition-all duration-500"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.05)",
              backdropFilter: "blur(12px)",
            }}
          >
            <span className="relative flex h-2 w-2 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
                style={{ background: "#22c55e" }} />
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "#22c55e" }} />
            </span>
            <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.14em] sm:tracking-[0.2em] truncate"
              style={{ fontFamily: "var(--font-jetbrains-mono)", color: "rgba(200, 180, 160, 0.85)" }}>
              AI-Powered Business Intelligence
            </span>
          </motion.div>
        </HeroSearch>

        {/* Main headline — massive, bold, Sora */}
        <HeroTitle
          className="text-4xl sm:text-6xl md:text-7xl lg:text-[100px] font-extrabold text-white mb-6 sm:mb-8 leading-[1.05] sm:leading-[0.92] tracking-[-0.03em]"
          style={{ fontFamily: "var(--font-sora)" }}
        >
          Your Cafe&apos;s
          <br />
          <span className="gradient-text">AI Growth</span>
          <br />
          Engine
        </HeroTitle>

        {/* Subtitle */}
        <HeroSubtitle className="text-base sm:text-lg sm:text-xl max-w-2xl mx-auto mb-10 sm:mb-14 leading-relaxed px-2"
          style={{ color: "rgba(200, 180, 160, 0.75)" }}>
          Five AI agents analyzing weather, competitors, and your menu — delivering
          daily actions to maximize revenue.
        </HeroSubtitle>

        {/* CTA buttons */}
        <HeroSearch>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto max-w-xs sm:max-w-none mx-auto">
            <Link href="/auth/register"
              className="group relative w-full sm:w-auto px-8 sm:px-10 py-3.5 sm:py-4 rounded-full text-white font-semibold text-sm sm:text-base btn-glow overflow-hidden cursor-pointer text-center"
              style={{ background: "linear-gradient(135deg, #e07850, #c86040)" }}>
              <span className="relative z-10 flex items-center justify-center gap-2.5">
                Start Free Trial
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </Link>
            <Link href="/auth/login"
              className="group w-full sm:w-auto px-8 sm:px-10 py-3.5 sm:py-4 rounded-full font-medium text-sm sm:text-base transition-all duration-400 cursor-pointer text-center"
              style={{
                border: "1px solid rgba(255,255,255,0.06)",
                background: "rgba(255,255,255,0.02)",
                color: "rgba(200, 180, 160, 0.8)",
              }}>
              <span className="flex items-center justify-center gap-2">
                Sign in
                <svg className="w-3.5 h-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </Link>
          </div>
        </HeroSearch>

        {/* Inline stats — editorial style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 lg:gap-10 mt-14 sm:mt-20 px-2"
        >
          {[
            { val: "5", label: "AI Agents" },
            { val: "24/7", label: "Monitoring" },
            { val: "3", label: "Data Sources" },
          ].map((s, i) => (
            <div key={s.label} className="flex items-center gap-2 sm:gap-3">
              {i > 0 && <div className="hidden sm:block w-px h-6" style={{ background: "rgba(224, 120, 80, 0.15)" }} />}
              <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold gradient-text" style={{ fontFamily: "var(--font-sora)" }}>
                {s.val}
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-wider"
                style={{ fontFamily: "var(--font-jetbrains-mono)", color: "rgba(160, 152, 144, 0.8)" }}>
                {s.label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 1.8, duration: 0.8 }}
        className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none"
      >
        <span className="text-[9px] mb-2 sm:mb-3 tracking-[0.25em] uppercase"
          style={{ fontFamily: "var(--font-jetbrains-mono)", color: "rgba(160, 152, 144, 0.7)" }}>
          Scroll
        </span>
        <motion.div className="w-4 h-7 sm:w-5 sm:h-8 rounded-full flex justify-center pt-1 sm:pt-1.5"
          style={{ border: "1px solid rgba(224, 120, 80, 0.15)" }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
          <motion.div className="w-1 h-1.5 rounded-full"
            style={{ background: "rgba(224, 120, 80, 0.5)" }}
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }} />
        </motion.div>
      </motion.div>
    </section>
  );
}
