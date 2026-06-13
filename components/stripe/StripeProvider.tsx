'use client';

import { StripeElementsOptions, loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useMemo } from 'react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '');

export function StripeProvider({ children, clientSecret }: { children: React.ReactNode; clientSecret: string }) {
  const options: StripeElementsOptions = useMemo(
    () => ({
      clientSecret,
      appearance: {
        theme: 'night' as const,
        variables: {
          colorPrimary: '#e07850',
          colorBackground: '#161412',
          colorText: '#ffffff',
          colorDanger: '#ef4444',
          fontFamily: 'inherit',
          borderRadius: '12px',
          spacingUnit: '4px',
        },
        rules: {
          '.Input': {
            border: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
          },
          '.Input:focus': {
            border: '1px solid rgba(224, 120, 80, 0.4)',
            boxShadow: '0 0 0 1px rgba(224, 120, 80, 0.2)',
          },
          '.Label': {
            color: 'rgba(160, 152, 144, 0.7)',
            fontSize: '12px',
          },
        },
      },
    }),
    [clientSecret]
  );

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
}
