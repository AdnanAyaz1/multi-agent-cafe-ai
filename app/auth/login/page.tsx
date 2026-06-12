import { Suspense } from 'react';
import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center animated-gradient-bg relative overflow-hidden">
      <div className="fixed inset-0 dot-grid pointer-events-none z-0 opacity-50" />

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00d2ff]/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#1fe19e]/8 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d2ff] to-[#1fe19e] flex items-center justify-center shadow-lg shadow-[#00d2ff]/25 group-hover:shadow-[#00d2ff]/40 transition-shadow">
              <span className="text-[#003543] font-bold text-sm" style={{ fontFamily: 'var(--font-montserrat)' }}>
                C
              </span>
            </div>
            <span className="text-lg font-bold text-white tracking-tight" style={{ fontFamily: 'var(--font-montserrat)' }}>
              CafePromo AI
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-white tracking-tight" style={{ fontFamily: 'var(--font-montserrat)' }}>
            Welcome back
          </h1>
          <p className="mt-2 text-[#859399] text-sm">Sign in to your CafePromo AI dashboard</p>
        </div>

        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
