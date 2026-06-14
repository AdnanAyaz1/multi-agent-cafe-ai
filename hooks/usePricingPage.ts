'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

export function usePricingPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (planKey: string) => {
    if (!session) {
      sessionStorage.setItem('pendingCheckout', planKey);
      window.location.replace(`/auth/login?checkout=${planKey}`);
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
        window.location.replace(`/auth/login?checkout=${planKey}`);
        return;
      }
      const data = await res.json();
      if (data.url) {
        window.location.replace(data.url);
      }
    } catch {
      setLoading(null);
      toast.error('Failed to start checkout. Please try again.');
    }
  };

  return {
    session,
    loading,
    handleCheckout,
  };
}
