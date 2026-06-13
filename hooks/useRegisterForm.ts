'use client';

import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useState, useCallback } from 'react';

type Step = 'account' | 'business' | 'competitors';

export interface UseRegisterFormReturn {
  step: Step;
  loading: boolean;
  error: string;
  setStep: (step: Step) => void;
  nextStep: () => void;
  prevStep: () => void;
  submit: (data: {
    name: string;
    email: string;
    password: string;
    businessName: string;
    businessType: string;
    city: string;
    timezone: string;
    competitorUrls: string[];
    plan: string;
  }) => Promise<void>;
  clearError: () => void;
  currentStepIndex: number;
}

const STEPS: Step[] = ['account', 'business', 'competitors'];

export function useRegisterForm(): UseRegisterFormReturn {
  const router = useRouter();
  const [step, setStep] = useState<Step>('account');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const currentStepIndex = STEPS.indexOf(step);

  const clearError = useCallback(() => setError(''), []);

  const nextStep = useCallback(() => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      setStep(STEPS[nextIndex]);
      setError('');
    }
  }, [currentStepIndex]);

  const prevStep = useCallback(() => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setStep(STEPS[prevIndex]);
      setError('');
    }
  }, [currentStepIndex]);

  const submit = useCallback(
    async (data: {
      name: string;
      email: string;
      password: string;
      businessName: string;
      businessType: string;
      city: string;
      timezone: string;
      competitorUrls: string[];
      plan: string;
    }) => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: data.name,
            email: data.email,
            password: data.password,
            business: {
              name: data.businessName,
              type: data.businessType,
              city: data.city,
              timezone: data.timezone,
            },
            competitors: data.competitorUrls.filter((url) => url.trim() !== ''),
            plan: data.plan,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          setError(result.error || 'Registration failed. Please try again.');
          setLoading(false);
          return;
        }

        const signInResult = await signIn('credentials', {
          email: data.email,
          password: data.password,
          redirect: false,
        });

        if (signInResult?.error) {
          setError('Account created but sign-in failed. Please go to login.');
          return;
        }

        router.push('/pricing');
        router.refresh();
      } catch {
        setError('Something went wrong. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  return {
    step,
    loading,
    error,
    setStep,
    nextStep,
    prevStep,
    submit,
    clearError,
    currentStepIndex,
  };
}
