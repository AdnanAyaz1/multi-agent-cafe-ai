'use client';

import { useSession } from 'next-auth/react';

export function usePricingPage() {
  const { data: session } = useSession();

  const handleCheckout = async (planKey: string) => {
    if (!session) {
      sessionStorage.setItem('pendingCheckout', planKey);
      window.location.replace(`/auth/login?checkout=${planKey}`);
      return;
    }

    window.location.replace(`/checkout?plan=${planKey}`);
  };

  return {
    session,
    handleCheckout,
  };
}
