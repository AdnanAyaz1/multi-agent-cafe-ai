'use client';

import { useState, useEffect } from 'react';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

export function useCheckoutPage(plan: string | null, router: AppRouterInstance) {
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

  return { clientSecret, loading };
}
