"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function CTASection() {
  return (
    <section className="py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="relative rounded-[2rem] overflow-hidden group">
          {/* Base gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0e1417] via-[#0a1a2e] to-[#0e1417]" />

          {/* Animated gradient mesh */}
          <div className="absolute inset-0 opacity-60">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_20%_20%,rgba(0,210,255,0.15)_0%,transparent_50%)]" />
            <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_80%_80%,rgba(31,225,158,0.12)_0%,transparent_50%)]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_50%_50%,rgba(0,210,255,0.05)_0%,transparent_40%)]" />
          </div>

          {/* Animated border gradient */}
          <div className="absolute inset-0 rounded-[2rem] p-px bg-gradient-to-r from-[#00d2ff]/20 via-[#1fe19e]/10 to-[#00d2ff]/20 -webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0); -webkit-mask-composite:xor; mask-composite:exclude; opacity-50 group-hover:opacity-100 transition-opacity duration-700" />

          {/* Floating orbs */}
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#00d2ff]/10 rounded-full blur-[120px] pointer-events-none group-hover:bg-[#00d2ff]/15 transition-colors duration-700" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-[#1fe19e]/10 rounded-full blur-[120px] pointer-events-none group-hover:bg-[#1fe19e]/15 transition-colors duration-700" />

          <div className="relative grid lg:grid-cols-2 gap-8 items-center p-8 lg:p-14">
            {/* Left - Text */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4 leading-tight" style={{ fontFamily: "var(--font-montserrat)" }}>
                Ready to grow your cafe?
              </h2>
              <p className="text-white/60 text-lg max-w-md mb-8">
                Join cafes using AI to make smarter decisions every day. Start your free
                trial — no credit card required.
              </p>
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <Link
                  href="/auth/register"
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#00d2ff] to-[#1fe19e] text-[#003543] font-bold text-base hover:shadow-lg hover:shadow-[#00d2ff]/25 transition-all duration-300 hover:-translate-y-0.5"
                >
                  Start Free Trial
                </Link>
                <Link
                  href="/auth/login"
                  className="px-8 py-4 rounded-2xl border border-white/[0.08] text-white/70 font-medium text-base hover:bg-white/[0.04] hover:border-white/[0.15] hover:text-white transition-all duration-300"
                >
                  Sign in
                </Link>
              </div>
            </motion.div>

            {/* Right - Floating mini cards */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="relative hidden lg:flex items-center justify-center h-64"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-4 left-8 glass-card rounded-2xl px-5 py-3"
              >
                <p className="text-[10px] text-[#859399] uppercase tracking-wider mb-1" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>Daily Revenue</p>
                <p className="text-2xl font-extrabold gradient-text" style={{ fontFamily: "var(--font-montserrat)" }}>$2,847</p>
              </motion.div>

              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute bottom-4 right-8 glass-card rounded-2xl px-5 py-3"
              >
                <p className="text-[10px] text-[#859399] uppercase tracking-wider mb-1" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>Actions Today</p>
                <p className="text-xl font-extrabold text-white" style={{ fontFamily: "var(--font-montserrat)" }}>8 recommended</p>
              </motion.div>

              <motion.div
                animate={{ y: [0, -6, 0], rotate: [0, 2, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute top-1/2 -translate-y-1/2 right-20 glass-card rounded-2xl px-4 py-3"
              >
                <p className="text-[10px] text-[#859399] uppercase tracking-wider mb-1" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>Agents</p>
                <p className="text-lg font-extrabold text-white" style={{ fontFamily: "var(--font-montserrat)" }}>5 active</p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
