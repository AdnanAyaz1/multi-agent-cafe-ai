'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function DashboardGuardInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [allowed, setAllowed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkPlan = async () => {
      try {
        const justUpgraded = searchParams.get('upgraded') === 'true';

        if (justUpgraded) {
          await fetch('/api/stripe/verify-subscription', { method: 'POST' });
          await new Promise((r) => setTimeout(r, 1000));
        }

        const res = await fetch('/api/stripe/subscription');
        const data = await res.json();
        const plan = data.subscription?.plan;

        if (!plan || plan === 'free') {
          if (justUpgraded) {
            await new Promise((r) => setTimeout(r, 2000));
            const retry = await fetch('/api/stripe/subscription');
            const retryData = await retry.json();
            if (retryData.subscription?.plan && retryData.subscription.plan !== 'free') {
              setAllowed(true);
              return;
            }
          }
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
  }, [router, searchParams]);

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-[#e07850] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!allowed) return null;

  return <>{children}</>;
}

export function DashboardGuard({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-[#e07850] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <DashboardGuardInner>{children}</DashboardGuardInner>
    </Suspense>
  );
}
