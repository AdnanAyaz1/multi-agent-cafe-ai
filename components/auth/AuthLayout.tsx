import Link from 'next/link';
import { AUTH_FEATURES } from '@/constants/features';

const AUTH_FEATURE_ICONS = [
  <svg key="check" className="w-5 h-5 text-[#c8a070]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>,
  <svg key="lightning" className="w-5 h-5 text-[#e07850]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>,
  <svg key="currency" className="w-5 h-5 text-[#f5dcc8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>,
];

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex animated-gradient-bg relative overflow-hidden">
      <div className="fixed inset-0 dot-grid pointer-events-none z-0 opacity-50" />

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#e07850]/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#c8a070]/8 rounded-full blur-[120px] pointer-events-none" />

      {/* Left panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative z-10 flex-col justify-between p-12">
        <div>
          <Link href="/" className="flex items-center gap-3 mb-20 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#e07850] to-[#c8a070] flex items-center justify-center shadow-lg shadow-[#e07850]/25 group-hover:shadow-[#e07850]/40 transition-shadow">
              <span className="text-[#1a1208] font-bold text-sm" style={{ fontFamily: 'var(--font-montserrat)' }}>
                C
              </span>
            </div>
            <span className="text-lg font-bold text-white tracking-tight" style={{ fontFamily: 'var(--font-montserrat)' }}>
              CafePromo AI
            </span>
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-12 gradient-bg" />
            <p
              className="text-[11px] text-[#e07850] uppercase tracking-[0.2em] font-semibold"
              style={{ fontFamily: 'var(--font-jetbrains-mono)' }}
            >
              Get Started
            </p>
          </div>

          <h1
            className="text-5xl font-extrabold text-white leading-[0.95] tracking-tighter uppercase mb-6"
            style={{ fontFamily: 'var(--font-montserrat)' }}
          >
            Set up your
            <br />
            <span className="gradient-text">cafe</span> in minutes
          </h1>
          <p className="text-lg text-[#a09890] leading-relaxed max-w-md">
            Connect your menu, add competitors, and let our AI agents start working for your business today.
          </p>
        </div>

        {/* Feature cards */}
        <div className="space-y-4 mt-12">
          {AUTH_FEATURES.map((feature, i) => (
            <div
              key={feature.title}
              className="glass-card rounded-2xl p-5 border border-white/[0.06] group hover:border-white/[0.12] transition-all duration-500"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center flex-shrink-0">
                  {AUTH_FEATURE_ICONS[i]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{feature.title}</p>
                  <p className="text-xs text-[#a09890]">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 relative z-10 flex flex-col p-8 lg:p-12">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-3 mb-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#e07850] to-[#c8a070] flex items-center justify-center shadow-lg shadow-[#e07850]/25">
              <span className="text-[#1a1208] font-bold text-sm" style={{ fontFamily: 'var(--font-montserrat)' }}>
                C
              </span>
            </div>
            <span className="text-lg font-bold text-white" style={{ fontFamily: 'var(--font-montserrat)' }}>
              CafePromo AI
            </span>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
