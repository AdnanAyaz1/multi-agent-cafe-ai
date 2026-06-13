'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { StripeProvider } from '@/components/stripe/StripeProvider';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { ArrowLeft, Shield, CheckCircle2 } from 'lucide-react';

import { CHECKOUT_PLAN_DETAILS } from '@/constants/checkout';

function CheckoutForm({ plan }: { plan: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const details = CHECKOUT_PLAN_DETAILS[plan];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError('');

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard/settings`,
      },
    });

    if (submitError) {
      setError(submitError.message ?? 'Payment failed');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full py-3.5 rounded-xl text-white font-semibold text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:shadow-[0_0_24px_-4px_rgba(224,120,80,0.3)]"
        style={{ background: "linear-gradient(135deg, #e07850, #c86040)" }}
      >
        {loading ? 'Processing...' : `Subscribe to ${details?.name ?? plan}`}
      </button>

      <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-600">
        <Shield className="w-3 h-3" />
        <span>Secured by Stripe. Your payment info is encrypted.</span>
      </div>
    </form>
  );
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan');
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!plan) {
      router.replace('/pricing');
      return;
    }

    const createPayment = async () => {
      try {
        const res = await fetch('/api/stripe/payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan }),
        });

        if (res.status === 401) {
          router.replace(`/auth/login?checkout=${plan}`);
          return;
        }

        const data = await res.json();
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          router.replace('/pricing');
        }
      } catch {
        router.replace('/pricing');
      } finally {
        setLoading(false);
      }
    };

    createPayment();
  }, [plan, router]);

  const details = CHECKOUT_PLAN_DETAILS[plan ?? ''];

  return (
    <div className="min-h-screen" style={{ background: '#0e0c0a' }}>
      {/* Top bar */}
      <nav className="h-16 flex items-center justify-between px-6 lg:px-10 border-b border-white/[0.06]"
        style={{ background: 'rgba(14, 12, 10, 0.85)', backdropFilter: 'blur(20px)' }}>
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#e07850] to-[#c8a070] flex items-center justify-center">
            <span className="text-[#1a1208] font-bold text-xs">C</span>
          </div>
          <span className="text-white text-sm font-bold">CafePromo AI</span>
        </Link>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </nav>

      {/* Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4 py-12">
        <div className="w-full max-w-md">
          {/* Plan summary */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Complete your subscription</h1>
            <p className="text-zinc-500 text-sm">
              {details ? (
                <>
                  <span className="text-white font-semibold">{details.name}</span> plan — {details.price}{details.period}
                </>
              ) : (
                'Setting up your plan...'
              )}
            </p>
          </div>

          {/* Payment card */}
          <div className="rounded-2xl p-6"
            style={{
              background: "linear-gradient(160deg, rgba(22, 20, 18, 0.9), rgba(14, 12, 10, 0.7))",
              border: "1px solid rgba(224, 120, 80, 0.08)",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4)",
            }}
          >
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-10 h-10 border-2 border-[#e07850] border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-zinc-500 text-sm">Preparing checkout...</p>
              </div>
            ) : clientSecret ? (
              <StripeProvider clientSecret={clientSecret}>
                <CheckoutForm plan={plan ?? ''} />
              </StripeProvider>
            ) : (
              <div className="text-center py-12">
                <p className="text-red-400 text-sm">Failed to initialize payment. Please try again.</p>
                <button
                  onClick={() => router.replace('/pricing')}
                  className="mt-4 text-sm text-[#e07850] hover:underline"
                >
                  Go back to pricing
                </button>
              </div>
            )}
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-4 mt-6">
            {['256-bit SSL', 'PCI Compliant', 'Cancel anytime'].map((badge) => (
              <div key={badge} className="flex items-center gap-1.5 text-[10px] text-zinc-600">
                <CheckCircle2 className="w-3 h-3" />
                <span>{badge}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const loadingFallback = (
  <div className="flex items-center justify-center min-h-screen" style={{ background: '#0e0c0a' }}>
    <div className="w-10 h-10 border-2 border-[#e07850] border-t-transparent rounded-full animate-spin" />
  </div>
);

export default function CheckoutPage() {
  return (
    <Suspense fallback={loadingFallback}>
      <CheckoutContent />
    </Suspense>
  );
}
