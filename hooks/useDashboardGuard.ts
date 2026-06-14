'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useDashboardGuard() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkPlan = async () => {
      try {
        const res = await fetch('/api/stripe/subscription');
        const data = await res.json();
        const plan = data.subscription?.plan;

        if (!plan) {
          router.replace('/pricing');
          return;
        }

        setAllowed(true);
      } catch {
        setAllowed(true);
      } finally {
        setChecking(false);
      }
    };

    checkPlan();
  }, [router]);

  return { allowed, checking };
}
