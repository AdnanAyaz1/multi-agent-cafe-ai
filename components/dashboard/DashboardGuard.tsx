'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function DashboardGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkPlan = async () => {
      try {
        const res = await fetch('/api/stripe/subscription');
        const data = await res.json();
        const plan = data.subscription?.plan;

        if (!plan || plan === 'free') {
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
