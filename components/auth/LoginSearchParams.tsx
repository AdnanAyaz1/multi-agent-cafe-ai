'use client';

import { LoginForm } from './LoginForm';
import type { LoginSearchParamsProps } from '@/types/auth';

export function LoginSearchParams({ checkoutPlan }: LoginSearchParamsProps) {
  const callbackUrl = checkoutPlan ? `/checkout?plan=${checkoutPlan}` : '/dashboard';
  return <LoginForm callbackUrl={callbackUrl} />;
}
