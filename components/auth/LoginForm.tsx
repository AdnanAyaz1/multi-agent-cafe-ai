'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { loginSchema, type LoginInput } from '@/lib/validators/auth';
import { useLoginForm } from '@/hooks/useLoginForm';
import { FormField } from '@/components/ui/form-field';
import { FormInput } from '@/components/ui/form-input';

interface LoginFormProps {
  callbackUrl?: string;
}

export function LoginForm({ callbackUrl = '/dashboard' }: LoginFormProps) {
  const { loading, error, login, clearError } = useLoginForm();

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    await login(data.email, data.password, callbackUrl);
  });

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl });
  };

  return (
    <div className="glass-card rounded-3xl p-8 border border-white/[0.08]">
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Email" error={form.formState.errors.email?.message}>
          <FormInput
            {...form.register('email', { onChange: clearError })}
            type="email"
            placeholder="you@example.com"
            error={!!form.formState.errors.email}
          />
        </FormField>

        <FormField label="Password" error={form.formState.errors.password?.message}>
          <FormInput
            {...form.register('password', { onChange: clearError })}
            type="password"
            placeholder="••••••••"
            error={!!form.formState.errors.password}
          />
        </FormField>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#e07850] to-[#c8a070] text-[#1a1208] text-sm font-bold hover:shadow-[#e07850]/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-[#e07850]/25 hover:-translate-y-0.5"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <div className="my-6 flex items-center gap-4">
        <div className="flex-1 h-px bg-white/[0.08]" />
        <span
          className="text-[10px] text-[#a09890] uppercase tracking-[0.15em]"
          style={{ fontFamily: 'var(--font-jetbrains-mono)' }}
        >
          or
        </span>
        <div className="flex-1 h-px bg-white/[0.08]" />
      </div>

      <button
        onClick={handleGoogleSignIn}
        className="w-full py-3 px-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white font-medium hover:bg-white/[0.06] hover:border-white/[0.15] transition-all duration-300 flex items-center justify-center gap-3"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Continue with Google
      </button>
    </div>
  );
}
