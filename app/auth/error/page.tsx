"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AUTH_ERROR_MESSAGES } from "@/constants/icons";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const errorType = searchParams.get("error") || "Default";
  const errorMessage = AUTH_ERROR_MESSAGES[errorType] || AUTH_ERROR_MESSAGES.Default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0e0c0a] relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 gradient-mesh" />
      <div className="absolute inset-0 bg-grid opacity-30" />

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="backdrop-blur-xl rounded-2xl p-8 shadow-2xl text-center"
          style={{ background: 'rgba(22, 20, 18, 0.8)', border: '1px solid rgba(224, 120, 80, 0.08)' }}>
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <h1 className="text-2xl font-semibold text-white mb-2">Authentication Error</h1>
          <p className="mb-6" style={{ color: 'rgba(160, 152, 144, 0.7)' }}>{errorMessage}</p>

          <Link
            href="/auth/login"
            className="inline-block py-3 px-6 rounded-xl text-white font-semibold transition-all shadow-lg"
            style={{ background: 'linear-gradient(135deg, #e07850, #c86040)', boxShadow: '0 4px 20px -4px rgba(224, 120, 80, 0.3)' }}
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

const loadingFallback = (
  <div className="min-h-screen flex items-center justify-center bg-[#0e0c0a]">
    <div className="w-8 h-8 border-2 border-[#e07850] border-t-transparent rounded-full animate-spin" />
  </div>
);

export default function AuthErrorPage() {
  return (
    <Suspense fallback={loadingFallback}>
      <AuthErrorContent />
    </Suspense>
  );
}
