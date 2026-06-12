"use client";

  import Link from "next/link";
  import { motion } from "framer-motion";
  import { HeroTitle, HeroSubtitle, HeroSearch } from "./HeroReveal";

export function HeroSection() {
  return (
     <section className="relative min-h-screen flex items-center overflow-hidden animated-gradient-bg">
       <div className="fixed inset-0 dot-grid pointer-events-none z-10 opacity-50" />
      <div className="absolute inset-0 z-[15] bg-[radial-gradient(ellipse_at_center,rgba(10,14,24,0.85)_0%,rgba(10,14,24,0.5)_50%,transparent_80%)]" />

      <div className="relative z-20 mx-auto max-w-7xl px-6 lg:px-8 w-full pt-28 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left - Text */}
          <div>
            <HeroSearch>
              <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1fe19e] animate-pulse" />
                <span className="text-xs font-mono uppercase tracking-[0.15em] text-[#859399]" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
                  AI-Powered Business Intelligence
                </span>
              </div>
            </HeroSearch>

            <HeroTitle
              className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-[0.95] tracking-tighter uppercase"
              style={{ fontFamily: "var(--font-montserrat)" }}
            >
              Your Cafe&apos;s <br />
              <span className="gradient-text">AI Growth</span> Engine
            </HeroTitle>

            <HeroSubtitle className="text-lg text-white/70 max-w-lg mb-10 leading-relaxed">
              Five AI agents analyzing weather, competitors, and your menu — delivering
              daily actions to maximize revenue.
            </HeroSubtitle>

            <HeroSearch>
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <Link
                  href="/auth/register"
                  className="group relative px-8 py-4 rounded-2xl bg-gradient-to-r from-[#00d2ff] to-[#1fe19e] text-[#003543] font-bold text-base transition-all duration-300 shadow-xl shadow-[#00d2ff]/25 hover:shadow-[#00d2ff]/40 hover:-translate-y-0.5"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Start Free Trial
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </Link>
                <Link
                  href="/auth/login"
                  className="px-8 py-4 rounded-2xl border border-white/[0.12] bg-white/[0.03] backdrop-blur-xl text-slate-300 font-medium text-base hover:bg-white/[0.06] hover:border-white/[0.2] transition-all duration-300"
                >
                  Sign in
                </Link>
              </div>
            </HeroSearch>

            {/* Inline stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="flex items-center gap-6 mt-12 pt-8 border-t border-white/[0.06]"
            >
              {[
                { val: "5", label: "AI Agents" },
                { val: "24/7", label: "Monitoring" },
                { val: "3", label: "Data Sources" },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-2">
                  <span className="text-xl font-extrabold gradient-text" style={{ fontFamily: "var(--font-montserrat)" }}>{s.val}</span>
                  <span className="text-[11px] text-[#859399] uppercase tracking-wider" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>{s.label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right - Floating AI Dashboard Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 40, rotateY: -8 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative hidden lg:block"
          >
            {/* Glow behind card */}
            <div className="absolute -inset-8 bg-[#00d2ff]/8 rounded-full blur-[80px]" />

            {/* Main dashboard card */}
            <div className="relative glass-card rounded-3xl p-6 border border-white/[0.08]">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00d2ff] to-[#1fe19e] flex items-center justify-center">
                    <svg className="w-4 h-4 text-[#003543]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">Daily Briefing</p>
                    <p className="text-[#859399] text-[10px] uppercase tracking-widest" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>Today&apos;s AI Analysis</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1fe19e]/10 border border-[#1fe19e]/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1fe19e] animate-pulse" />
                  <span className="text-[10px] text-[#1fe19e] font-medium" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>LIVE</span>
                </div>
              </div>

              {/* Weather strip */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] mb-4">
                <span className="text-2xl">☀️</span>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">32°C — Hot Day</p>
                  <p className="text-[#859399] text-[11px]">Promote cold drinks, iced coffee</p>
                </div>
                <span className="text-[10px] text-[#1fe19e] font-semibold px-2 py-1 rounded-full bg-[#1fe19e]/10" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>+18% rev</span>
              </div>

              {/* Action items */}
              <div className="space-y-2.5 mb-4">
                {[
                  { action: "Raise iced latte price", reason: "Peak demand window", badge: "AUTO" },
                  { action: "Promote cold brew", reason: "Competitor out of stock", badge: "REVIEW" },
                  { action: "Bundle pastry + iced tea", reason: "Low-margin pastry stock", badge: "AUTO" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-bold ${item.badge === "AUTO" ? "bg-[#1fe19e]/15 text-[#1fe19e]" : "bg-[#00d2ff]/15 text-[#00d2ff]"}`} style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
                      {item.badge === "AUTO" ? "✓" : "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-[13px] font-medium truncate">{item.action}</p>
                      <p className="text-[#859399] text-[11px]">{item.reason}</p>
                    </div>
                    <span className="text-[9px] text-[#859399] px-2 py-0.5 rounded-full border border-white/[0.06]" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>{item.badge}</span>
                  </div>
                ))}
              </div>

              {/* Bottom bar */}
              <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
                <span className="text-[10px] text-[#859399] uppercase tracking-wider" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>5 agents active</span>
                <div className="flex -space-x-1.5">
                  {["bg-[#00d2ff]", "bg-[#1fe19e]", "bg-[#ffd79f]", "bg-[#a78bfa]", "bg-[#f87171]"].map((c, i) => (
                    <div key={i} className={`w-5 h-5 rounded-full ${c} border-2 border-[#0e1417]`} />
                  ))}
                </div>
              </div>
            </div>

            {/* Floating mini cards */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 -right-4 glass-card rounded-xl px-4 py-3 border border-white/[0.08] shadow-xl"
            >
              <p className="text-[10px] text-[#859399] uppercase tracking-wider mb-1" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>Revenue Impact</p>
              <p className="text-2xl font-extrabold gradient-text" style={{ fontFamily: "var(--font-montserrat)" }}>+23%</p>
            </motion.div>

            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-4 -left-6 glass-card rounded-xl px-4 py-3 border border-white/[0.08] shadow-xl"
            >
              <p className="text-[10px] text-[#859399] uppercase tracking-wider mb-1" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>Competitors Tracked</p>
              <p className="text-xl font-extrabold text-white" style={{ fontFamily: "var(--font-montserrat)" }}>12 nearby</p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center"
      >
        <span className="text-[10px] text-[#859399] mb-2 tracking-widest uppercase" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>Scroll</span>
        <motion.svg
          className="w-5 h-5 text-[#00d2ff]"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </motion.div>
    </section>
  );
}
