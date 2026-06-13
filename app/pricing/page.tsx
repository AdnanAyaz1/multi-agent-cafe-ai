'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useSession } from 'next-auth/react';

const plans = [
  {
    name: 'Starter',
    price: '0',
    period: 'forever',
    description: 'For cafes just getting started with AI.',
    features: ['1 AI Agent', 'Daily weather analysis', 'Basic recommendations', 'Email support'],
    cta: 'Get Started Free',
    href: '/auth/register',
    planKey: null,
    popular: false,
  },
  {
    name: 'Growth',
    price: '49',
    period: '/month',
    description: 'For cafes ready to maximize revenue.',
    features: ['5 AI Agents', 'Competitor tracking', 'Advanced pricing engine', 'Auto-approve changes', 'Priority support', 'Weekly reports'],
    cta: 'Start Free Trial',
    href: null,
    planKey: 'growth' as const,
    popular: true,
  },
  {
    name: 'Enterprise',
    price: '199',
    period: '/month',
    description: 'For multi-location cafe chains.',
    features: ['Unlimited AI Agents', 'Custom AI training', 'API access', 'Multi-location dashboard', 'Dedicated account manager', 'Custom integrations'],
    cta: 'Contact Sales',
    href: null,
    planKey: 'enterprise' as const,
    popular: false,
  },
];

export default function PricingPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (planKey: string) => {
    if (!session) {
      sessionStorage.setItem('pendingCheckout', planKey);
      window.location.href = `/auth/login?checkout=${planKey}`;
      return;
    }

    setLoading(planKey);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planKey }),
      });
      if (res.status === 401) {
        window.location.href = `/auth/login?checkout=${planKey}`;
        return;
      }
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: '#0e0c0a' }}>
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6 lg:px-10 border-b border-white/[0.06]"
        style={{ background: 'rgba(14, 12, 10, 0.85)', backdropFilter: 'blur(20px)' }}>
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#e07850] to-[#c8a070] flex items-center justify-center">
            <span className="text-[#1a1208] font-bold text-xs">C</span>
          </div>
          <span className="text-white text-sm font-bold">CafePromo AI</span>
        </Link>
        <div className="flex items-center gap-3">
          {session ? (
            <Link href="/dashboard"
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-white/[0.06] border border-white/[0.08] hover:bg-white/[0.1] transition-all">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/auth/login" className="px-4 py-2 rounded-xl text-sm font-semibold text-zinc-400 hover:text-white transition-colors">
                Sign in
              </Link>
              <Link href="/auth/register"
                className="px-4 py-2 rounded-xl text-sm font-semibold text-[#1a1208]"
                style={{ background: 'linear-gradient(135deg, #e07850, #c86040)' }}>
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Content */}
      <div className="pt-32 pb-24 px-6 lg:px-10 max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-10" style={{ background: 'linear-gradient(90deg, transparent, rgba(224, 120, 80, 0.3))' }} />
            <p className="text-[10px] uppercase tracking-[0.3em] font-semibold text-[#e07850]"
              style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
              Pricing
            </p>
            <div className="h-px w-10" style={{ background: 'linear-gradient(90deg, rgba(224, 120, 80, 0.3), transparent)' }} />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
            Choose your plan
          </h1>
          <p className="text-zinc-400 text-lg max-w-lg mx-auto">
            Start free, upgrade when you&apos;re ready. All paid plans include a 14-day trial.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl p-8 transition-all duration-500 ${
                plan.popular
                  ? 'animated-border md:-mt-4 md:mb-4'
                  : 'dash-glass'
              }`}
              style={plan.popular ? {
                background: 'linear-gradient(160deg, rgba(224, 120, 80, 0.06), rgba(20, 18, 16, 0.9))',
              } : undefined}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-white text-[10px] font-bold uppercase tracking-wider z-10 btn-glow"
                  style={{ fontFamily: 'var(--font-jetbrains-mono)', background: 'linear-gradient(135deg, #e07850, #c86040)' }}>
                  Most Popular
                </div>
              )}

              <div className="relative z-10">
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-sm text-zinc-500 mb-8">{plan.description}</p>

                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-sm text-zinc-500">$</span>
                  <span className="text-5xl font-extrabold text-white tracking-tight">{plan.price}</span>
                  <span className="text-sm text-zinc-500 ml-1">{plan.period}</span>
                </div>

                {plan.href ? (
                  <Link href={plan.href}
                    className={`block w-full py-3.5 rounded-xl text-center font-semibold text-sm transition-all duration-300 mb-8 ${
                      plan.popular ? 'text-white btn-glow' : 'border border-white/[0.08] bg-white/[0.02] text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                    style={plan.popular ? { background: 'linear-gradient(135deg, #e07850, #c86040)' } : undefined}>
                    {plan.cta}
                  </Link>
                ) : (
                  <button
                    onClick={() => plan.planKey && handleCheckout(plan.planKey)}
                    disabled={loading === plan.planKey}
                    className={`block w-full py-3.5 rounded-xl text-center font-semibold text-sm transition-all duration-300 mb-8 cursor-pointer disabled:opacity-50 ${
                      plan.popular ? 'text-white btn-glow' : 'border border-white/[0.08] bg-white/[0.02] text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                    style={plan.popular ? { background: 'linear-gradient(135deg, #e07850, #c86040)' } : undefined}>
                    {loading === plan.planKey ? 'Redirecting...' : plan.cta}
                  </button>
                )}

                <div className="space-y-3">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                        style={{ background: plan.popular ? 'rgba(224, 120, 80, 0.12)' : 'rgba(224, 120, 80, 0.05)' }}>
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                          strokeWidth={2.5} style={{ color: plan.popular ? '#e07850' : 'rgba(224, 120, 80, 0.5)' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-sm text-zinc-400">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p className="text-center text-zinc-600 text-xs mt-12">
          All plans include SSL, daily backups, and 99.9% uptime. Need help choosing?{' '}
          <Link href="/" className="text-[#e07850] hover:underline">Talk to us</Link>
        </p>
      </div>
    </div>
  );
}
