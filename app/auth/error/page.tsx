"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

const errors: Record<string, string> = {
  Configuration: "There is a problem with the server configuration.",
  AccessDenied: "You do not have permission to sign in.",
  Verification: "The verification link may have expired or already been used.",
  OAuthSignin: "Error starting the OAuth sign-in flow.",
  OAuthCallback: "Error handling the OAuth sign-in callback.",
  OAuthCreateAccount: "Could not create an OAuth account.",
  EmailCreateAccount: "Could not create an email account.",
  Callback: "Error in the OAuth callback handler.",
  OAuthAccountNotLinked: "This email is already associated with another account.",
  Default: "An unexpected error occurred.",
};

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const errorType = searchParams.get("error") || "Default";
  const errorMessage = errors[errorType] || errors.Default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0f1a] relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 gradient-mesh" />
      <div className="absolute inset-0 bg-grid opacity-30" />

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <h1 className="text-2xl font-semibold text-white mb-2">Authentication Error</h1>
          <p className="text-slate-400 mb-6">{errorMessage}</p>

          <Link
            href="/auth/login"
            className="inline-block py-3 px-6 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold hover:from-indigo-400 hover:to-violet-400 transition-all shadow-lg shadow-indigo-500/25"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
