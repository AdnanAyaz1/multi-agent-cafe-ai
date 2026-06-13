'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan');

  useEffect(() => {
    if (!plan) {
      router.replace('/pricing');
      return;
    }

    const runCheckout = async () => {
      try {
        const res = await fetch('/api/stripe/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan }),
        });

        if (res.status === 401) {
          router.replace(`/auth/login?checkout=${plan}`);
          return;
        }

        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        }
      } catch {
        router.replace('/dashboard');
      }
    };

    runCheckout();
  }, [plan, router]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0e0c0a' }}>
      <div className="text-center">
        <Link href="/" className="inline-flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#e07850] to-[#c8a070] flex items-center justify-center">
            <span className="text-[#1a1208] font-bold text-sm">C</span>
          </div>
          <span className="text-lg font-bold text-white tracking-tight">CafePromo AI</span>
        </Link>

        <div className="mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#e07850]/10 border border-[#e07850]/20 flex items-center justify-center mx-auto mb-4">
            <div className="w-5 h-5 border-2 border-[#e07850] border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-white text-sm font-semibold">Setting up your subscription</p>
          <p className="text-zinc-500 text-xs mt-1">Redirecting to Stripe checkout...</p>
        </div>

        <button
          onClick={() => router.replace('/dashboard')}
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
