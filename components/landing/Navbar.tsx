"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NAV_LINKS } from "@/constants/landing";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "nav-scrolled" : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00d2ff] to-[#1fe19e] flex items-center justify-center shadow-lg shadow-[#00d2ff]/25 group-hover:shadow-[#00d2ff]/40 transition-shadow">
              <span className="text-[#003543] font-bold text-sm" style={{ fontFamily: "var(--font-montserrat)" }}>C</span>
            </div>
            <span
              className="text-lg font-bold text-white tracking-tight"
              style={{ fontFamily: "var(--font-montserrat)" }}
            >
              CafePromo AI
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-[#859399] hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/auth/login"
              className="px-4 py-2 text-sm text-slate-300 font-medium hover:text-white transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/auth/register"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00d2ff] to-[#1fe19e] text-[#003543] text-sm font-semibold hover:shadow-[#00d2ff]/40 transition-all shadow-lg shadow-[#00d2ff]/25"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-slate-300 hover:text-white p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="md:hidden overflow-hidden border-t border-white/[0.08] mt-2 pt-4 pb-6"
            >
              <div className="flex flex-col gap-4">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="text-sm text-[#859399] hover:text-white transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </a>
                ))}
                <div className="flex flex-col gap-2 pt-2 border-t border-white/[0.08]">
                  <Link
                    href="/auth/login"
                    className="text-sm text-slate-300 hover:text-white transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/auth/register"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00d2ff] to-[#1fe19e] text-[#003543] text-sm font-semibold text-center"
                    onClick={() => setMobileOpen(false)}
                  >
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
