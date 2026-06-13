'use client';

import { useEffect, useState, useCallback } from 'react';

export type PlanKey = 'free' | 'growth' | 'enterprise';

interface PlanInfo {
  plan: PlanKey;
  status: string;
  loading: boolean;
}

const PAID_PLANS: PlanKey[] = ['growth', 'enterprise'];

export function usePlan(): PlanInfo & { isPaid: boolean; isEnterprise: boolean } {
  const [info, setInfo] = useState<PlanInfo>({ plan: 'free', status: 'active', loading: true });

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const res = await fetch('/api/stripe/subscription');
        const data = await res.json();
        setInfo({
          plan: data.subscription?.plan ?? 'free',
          status: data.subscription?.status ?? 'active',
          loading: false,
        });
      } catch {
        setInfo({ plan: 'free', status: 'active', loading: false });
      }
    };
    fetchPlan();
  }, []);

  return {
    ...info,
    isPaid: PAID_PLANS.includes(info.plan),
    isEnterprise: info.plan === 'enterprise',
  };
}
