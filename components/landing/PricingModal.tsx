'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { X } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    price: '0',
    period: 'forever',
    description: 'For cafes just getting started.',
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
    features: ['5 AI Agents', 'Competitor tracking', 'Advanced pricing engine', 'Auto-approve changes', 'Priority support'],
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
    features: ['Unlimited AI Agents', 'Custom AI training', 'API access', 'Multi-location dashboard', 'Dedicated account manager'],
    cta: 'Contact Sales',
    href: null,
    planKey: 'enterprise' as const,
    popular: false,
  },
];

interface PricingModalProps {
  open: boolean;
  onClose: () => void;
}

export function PricingModal({ open, onClose }: PricingModalProps) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState<string | null>(null);

  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [open, handleEscape]);

  const handleCheckout = async (planKey: string) => {
    if (!session) {
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl"
        style={{
          background: "linear-gradient(160deg, rgba(22, 20, 18, 0.98), rgba(14, 12, 10, 0.95))",
          border: "1px solid rgba(224, 120, 80, 0.08)",
          boxShadow: "0 0 80px -20px rgba(224, 120, 80, 0.1), 0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-0">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] font-semibold text-[#e07850] mb-1"
              style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
              Choose your plan
            </p>
            <p className="text-zinc-500 text-xs">All paid plans include a 14-day free trial</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-all duration-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-6 transition-all duration-500 ${
                plan.popular ? 'md:-mt-2 md:mb-2' : ''
              }`}
              style={{
                background: plan.popular
                  ? "linear-gradient(160deg, rgba(224, 120, 80, 0.06), rgba(20, 18, 16, 0.8))"
                  : "rgba(20, 18, 16, 0.5)",
                border: plan.popular
                  ? "1px solid rgba(224, 120, 80, 0.15)"
                  : "1px solid rgba(255, 255, 255, 0.04)",
              }}
            >
              {plan.popular && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-white text-[9px] font-bold uppercase tracking-wider"
                  style={{ fontFamily: "var(--font-jetbrains-mono)", background: "linear-gradient(135deg, #e07850, #c86040)" }}>
                  Popular
                </div>
              )}

              <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
              <p className="text-[11px] text-zinc-500 mb-5">{plan.description}</p>

              <div className="flex items-baseline gap-1 mb-5">
                <span className="text-xs text-zinc-500">$</span>
                <span className="text-4xl font-extrabold text-white tracking-tight">{plan.price}</span>
                <span className="text-xs text-zinc-500 ml-1">{plan.period}</span>
              </div>

              {plan.href ? (
                <a
                  href={plan.href}
                  className="block w-full py-2.5 rounded-xl text-center font-semibold text-sm transition-all duration-300 mb-5 border border-white/[0.08] bg-white/[0.02] text-zinc-400 hover:text-white hover:bg-white/[0.06]"
                >
                  {plan.cta}
                </a>
              ) : (
                <button
                  onClick={() => plan.planKey && handleCheckout(plan.planKey)}
                  disabled={loading === plan.planKey}
                  className={`block w-full py-2.5 rounded-xl text-center font-semibold text-sm transition-all duration-300 mb-5 cursor-pointer disabled:opacity-50 ${
                    plan.popular ? 'text-white' : 'border border-white/[0.08] bg-white/[0.02] text-zinc-400 hover:text-white hover:bg-white/[0.06]'
                  }`}
                  style={plan.popular ? { background: "linear-gradient(135deg, #e07850, #c86040)" } : undefined}
                >
                  {loading === plan.planKey ? 'Redirecting...' : plan.cta}
                </button>
              )}

              <div className="space-y-2.5">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2.5">
                    <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                      style={{ background: plan.popular ? "rgba(224, 120, 80, 0.12)" : "rgba(224, 120, 80, 0.05)" }}>
                      <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        strokeWidth={2.5} style={{ color: plan.popular ? "#e07850" : "rgba(224, 120, 80, 0.4)" }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[13px] text-zinc-400">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
