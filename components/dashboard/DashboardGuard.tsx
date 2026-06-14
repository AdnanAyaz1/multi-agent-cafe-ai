'use client';

import { Suspense } from 'react';
import { useDashboardGuard } from '@/hooks/useDashboardGuard';

function DashboardGuardInner({ children }: { children: React.ReactNode }) {
  const { allowed, checking } = useDashboardGuard();

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-[#e07850] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!allowed) return null;

  return <>{children}</>;
}

export function DashboardGuard({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-[#e07850] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <DashboardGuardInner>{children}</DashboardGuardInner>
    </Suspense>
  );
}
