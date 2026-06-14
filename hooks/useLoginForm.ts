'use client';

import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export interface UseLoginFormReturn {
  loading: boolean;
  error: string;
  login: (email: string, password: string, callbackUrl: string) => Promise<void>;
  clearError: () => void;
}

export function useLoginForm(): UseLoginFormReturn {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const clearError = useCallback(() => setError(''), []);

  const login = useCallback(
    async (email: string, password: string, callbackUrl: string) => {
      setLoading(true);
      setError('');
      try {
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });
        if (result?.error) {
          setError('Invalid email or password. Please try again.');
          toast.error('Invalid email or password');
        } else {
          toast.success('Welcome back!');
          router.push(callbackUrl);
          router.refresh();
        }
      } catch {
        setError('Something went wrong. Please try again.');
        toast.error('Login failed');
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  return { loading, error, login, clearError };
}
