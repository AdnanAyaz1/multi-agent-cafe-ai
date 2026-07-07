'use client';

import { useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

export function usePricingCheckout(_onClose?: () => void) {
  const { data: session } = useSession();

  const handleCheckout = useCallback(async (planKey: string) => {
    if (!session) {
      window.location.replace(`/auth/login?checkout=${planKey}`);
      return;
    }

    window.location.replace(`/checkout?plan=${planKey}`);
  }, [session]);

  return {
    handleCheckout,
  };
}

export function usePricingModal(open: boolean, onClose: () => void) {
  const { handleCheckout } = usePricingCheckout(onClose);

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
    handleCheckout,
  };
}
