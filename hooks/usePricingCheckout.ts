'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

export function usePricingCheckout(_onClose?: () => void) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = useCallback(async (planKey: string) => {
    if (!session) {
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
  }, [session]);

  return {
    loading,
    handleCheckout,
  };
}

export function usePricingModal(open: boolean, onClose: () => void) {
  const { loading, handleCheckout } = usePricingCheckout(onClose);

  useEffect(() => {
    if (!open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return {
    loading,
    handleCheckout,
  };
}
