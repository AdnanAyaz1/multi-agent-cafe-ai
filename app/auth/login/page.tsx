import { Suspense } from 'react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { LoginSearchParams } from '@/components/auth/LoginSearchParams';

interface LoginPageProps {
  searchParams: Promise<{ checkout?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const checkoutPlan = params.checkout;

  return (
    <AuthLayout>
      <Suspense>
        <LoginSearchParams checkoutPlan={checkoutPlan} />
      </Suspense>
    </AuthLayout>
  );
}
