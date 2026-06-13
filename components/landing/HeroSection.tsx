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
      <div className="glow-orb w-[600px] h-[600px] aurora-float"
        style={{ background: "rgba(224, 120, 80, 0.05)", top: "20%", left: "-10%", filter: "blur(100px)" }} />
      <div className="glow-orb w-[450px] h-[450px] aurora-float"
        style={{ background: "rgba(200, 160, 112, 0.04)", bottom: "15%", right: "-5%", filter: "blur(90px)", animationDelay: "-5s" }} />
      <div className="glow-orb w-[300px] h-[300px] aurora-float"
        style={{ background: "rgba(245, 220, 200, 0.03)", top: "55%", left: "50%", filter: "blur(80px)", animationDelay: "-9s" }} />

      {/* Subtle grid lines */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="absolute top-0 left-[20%] w-px h-full"
          style={{ background: "linear-gradient(to bottom, transparent, rgba(224, 120, 80, 0.03), transparent)" }} />
        <div className="absolute top-0 right-[20%] w-px h-full"
          style={{ background: "linear-gradient(to bottom, transparent, rgba(224, 120, 80, 0.03), transparent)" }} />
      </div>

      <div className="relative z-20 mx-auto max-w-6xl px-6 lg:px-8 w-full text-center pt-36 pb-24">
        {/* Status pill */}
        <HeroSearch>
          <motion.div
            initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full mb-12 group transition-all duration-500"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.05)",
              backdropFilter: "blur(12px)",
            }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
                style={{ background: "#22c55e" }} />
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "#22c55e" }} />
            </span>
            <span className="text-[11px] uppercase tracking-[0.2em]"
              style={{ fontFamily: "var(--font-jetbrains-mono)", color: "rgba(200, 180, 160, 0.7)" }}>
              AI-Powered Business Intelligence
            </span>
          </motion.div>
        </HeroSearch>

        {/* Main headline — massive, bold, Sora */}
        <HeroTitle
          className="text-5xl sm:text-7xl lg:text-[100px] font-extrabold text-white mb-8 leading-[0.92] tracking-[-0.03em]"
          style={{ fontFamily: "var(--font-sora)" }}
        >
          Your Cafe&apos;s
          <br />
          <span className="gradient-text">AI Growth</span>
          <br />
          Engine
        </HeroTitle>

        {/* Subtitle */}
        <HeroSubtitle className="text-lg sm:text-xl max-w-2xl mx-auto mb-14 leading-relaxed"
          style={{ color: "rgba(200, 180, 160, 0.65)" }}>
          Five AI agents analyzing weather, competitors, and your menu — delivering
          daily actions to maximize revenue.
        </HeroSubtitle>

        {/* CTA buttons */}
        <HeroSearch>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/register"
              className="group relative px-10 py-4 rounded-full text-white font-semibold text-base btn-glow overflow-hidden cursor-pointer"
              style={{ background: "linear-gradient(135deg, #e07850, #c86040)" }}>
              <span className="relative z-10 flex items-center gap-2.5">
                Start Free Trial
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </Link>
            <Link href="/auth/login"
              className="group px-10 py-4 rounded-full font-medium text-base transition-all duration-400 cursor-pointer"
              style={{
                border: "1px solid rgba(255,255,255,0.06)",
                background: "rgba(255,255,255,0.02)",
                color: "rgba(200, 180, 160, 0.7)",
              }}>
              <span className="flex items-center gap-2">
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
          className="flex items-center justify-center gap-6 sm:gap-10 mt-20"
        >
          {[
            { val: "5", label: "AI Agents" },
            { val: "24/7", label: "Monitoring" },
            { val: "3", label: "Data Sources" },
          ].map((s, i) => (
            <div key={s.label} className="flex items-center gap-3">
              {i > 0 && <div className="w-px h-6" style={{ background: "rgba(224, 120, 80, 0.1)" }} />}
              <span className="text-2xl sm:text-3xl font-extrabold gradient-text" style={{ fontFamily: "var(--font-sora)" }}>
                {s.val}
              </span>
              <span className="text-[10px] uppercase tracking-wider"
                style={{ fontFamily: "var(--font-jetbrains-mono)", color: "rgba(160, 152, 144, 0.7)" }}>
                {s.label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.35 }}
        transition={{ delay: 1.8, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center"
      >
        <span className="text-[9px] mb-3 tracking-[0.25em] uppercase"
          style={{ fontFamily: "var(--font-jetbrains-mono)", color: "rgba(160, 152, 144, 0.7)" }}>
          Scroll
        </span>
        <motion.div className="w-5 h-8 rounded-full flex justify-center pt-1.5"
          style={{ border: "1px solid rgba(224, 120, 80, 0.12)" }}
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
