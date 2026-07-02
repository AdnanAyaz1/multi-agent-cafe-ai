'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NAV_LINKS } from '@/constants/landing';

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${scrolled ? "nav-scrolled" : ""}`}>
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className={`flex items-center justify-between ${scrolled ? "h-16" : "h-20 lg:h-24"} transition-all duration-500`}>
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:scale-105"
                style={{ background: "linear-gradient(135deg, #e07850, #c8a070)", boxShadow: "0 4px 16px -2px rgba(224, 120, 80, 0.25)" }}>
                <span className="text-white font-bold text-sm" style={{ fontFamily: "var(--font-sora)" }}>C</span>
              </div>
            </div>
            <span className="text-lg font-bold text-white tracking-tight hidden sm:block" style={{ fontFamily: "var(--font-sora)" }}>
              Cafe<span style={{ color: "#e07850" }}>Promo</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1 rounded-full px-2 py-1.5"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href}
                className="px-4 py-2 text-[13px] rounded-full transition-all duration-300"
                style={{ color: "rgba(200, 180, 160, 0.8)" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#ede8e2"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(200, 180, 160, 0.8)"; e.currentTarget.style.background = "transparent"; }}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/auth/login" className="text-[13px] px-4 py-2 transition-colors duration-300"
              style={{ color: "rgba(200, 180, 160, 0.8)" }}>
              Sign in
            </Link>
            <Link href="/auth/register"
              className="relative px-7 py-2.5 rounded-full text-white text-[13px] font-semibold btn-glow overflow-hidden group"
              style={{ background: "linear-gradient(135deg, #e07850, #c86040)" }}>
              <span className="relative z-10 flex items-center gap-2">
                Get Started
                <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </Link>
          </div>

          <button className="md:hidden p-2 cursor-pointer" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            <div className="w-6 h-5 relative flex flex-col justify-between">
              <span className={`w-full h-0.5 rounded-full transition-all duration-300 origin-center ${mobileOpen ? "rotate-45 translate-y-[9px]" : ""}`}
                style={{ background: "rgba(200, 180, 160, 0.7)" }} />
              <span className={`w-full h-0.5 rounded-full transition-all duration-300 ${mobileOpen ? "opacity-0 scale-0" : ""}`}
                style={{ background: "rgba(200, 180, 160, 0.7)" }} />
              <span className={`w-full h-0.5 rounded-full transition-all duration-300 origin-center ${mobileOpen ? "-rotate-45 -translate-y-[9px]" : ""}`}
                style={{ background: "rgba(200, 180, 160, 0.7)" }} />
            </div>
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="md:hidden overflow-hidden rounded-2xl glass-card mb-4 mt-2"
            >
              <div className="flex flex-col gap-1 p-3">
                {NAV_LINKS.map((link) => (
                  <a key={link.href} href={link.href}
                    className="text-sm rounded-xl px-4 py-3 transition-all duration-200"
                    style={{ color: "rgba(200, 180, 160, 0.8)" }}
                    onClick={() => setMobileOpen(false)}>
                    {link.label}
                  </a>
                ))}
                <div className="flex flex-col gap-2 pt-2 mt-1" style={{ borderTop: "1px solid rgba(224, 120, 80, 0.12)" }}>
                  <Link href="/auth/login" className="text-sm rounded-xl px-4 py-3 transition-colors duration-200"
                    style={{ color: "rgba(200, 180, 160, 0.8)" }} onClick={() => setMobileOpen(false)}>
                    Sign in
                  </Link>
                  <Link href="/auth/register"
                    className="px-6 py-3 rounded-xl text-white text-sm font-semibold text-center btn-glow"
                    style={{ background: "linear-gradient(135deg, #e07850, #c86040)" }}
                    onClick={() => setMobileOpen(false)}>
                    Get Started
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
