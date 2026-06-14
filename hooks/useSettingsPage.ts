'use client';

import { useState, useEffect } from 'react';

const PLAN_LABELS: Record<string, { name: string; color: string }> = {
  free: { name: 'Starter (Free)', color: 'text-zinc-400' },
  growth: { name: 'Growth', color: 'text-[#e07850]' },
  enterprise: { name: 'Enterprise', color: 'text-amber-400' },
};

export function useSettingsPage() {
  const [showPricing, setShowPricing] = useState(false);
  const [plan, setPlan] = useState('free');
  const [status, setStatus] = useState('active');

  useEffect(() => {
    fetch('/api/stripe/subscription')
      .then((r) => r.json())
      .then((data) => {
        setPlan(data.subscription?.plan ?? 'free');
        setStatus(data.subscription?.status ?? 'active');
      })
      .catch(() => {});
  }, []);

  const planInfo = PLAN_LABELS[plan] ?? PLAN_LABELS.free;

  return {
    showPricing,
    setShowPricing,
    plan,
    status,
    planInfo,
  };
}
