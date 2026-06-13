'use client';

import { LoginForm } from './LoginForm';

interface LoginSearchParamsProps {
  checkoutPlan?: string;
}

export function LoginSearchParams({ checkoutPlan }: LoginSearchParamsProps) {
  const callbackUrl = checkoutPlan ? `/dashboard?checkout=${checkoutPlan}` : '/dashboard';
  return <LoginForm callbackUrl={callbackUrl} />;
}
