'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  registerStepSchemas,
  type AccountInput,
  type BusinessInput,
  type CompetitorsInput,
} from '@/lib/validators/auth';
import { useRegisterForm } from '@/hooks/useRegisterForm';
import { FormField } from '@/components/ui/form-field';
import { FormInput } from '@/components/ui/form-input';
import { FormSelect } from '@/components/ui/form-select';
import { BUSINESS_TYPES, TIMEZONES } from '@/constants/business';

export function RegisterForm() {
  const { step, loading, error, nextStep, prevStep, submit, clearError } =
    useRegisterForm();

  const [accountData, setAccountData] = useState<AccountInput | null>(null);
  const [businessData, setBusinessData] = useState<BusinessInput | null>(null);

  const handleAccountComplete = (data: AccountInput) => {
    setAccountData(data);
    nextStep();
  };

  const handleBusinessComplete = (data: BusinessInput) => {
    setBusinessData(data);
    nextStep();
  };

  const handleCompetitorsComplete = async (urls: string[]) => {
    if (!accountData || !businessData) return;
    await submit({
      name: accountData.name,
      email: accountData.email,
      password: accountData.password,
      businessName: businessData.businessName,
      businessType: businessData.businessType,
      city: businessData.city,
      timezone: businessData.timezone,
      competitorUrls: urls,
      plan: 'free',
    });
  };

  return (
    <div className="glass-card rounded-3xl p-8 border border-white/[0.08]">
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {step === 'account' && (
        <AccountStep onComplete={handleAccountComplete} onError={clearError} />
      )}

      {step === 'business' && (
        <BusinessStep onComplete={handleBusinessComplete} onBack={prevStep} onError={clearError} />
      )}

      {step === 'competitors' && (
        <CompetitorsStep
          onComplete={handleCompetitorsComplete}
          onBack={prevStep}
          onError={clearError}
          loading={loading}
        />
      )}

      <p className="mt-6 text-center text-sm text-[#a09890]">
        Already have an account?{' '}
        <a
          href="/auth/login"
          className="text-[#e07850] hover:text-[#e07850]/80 font-medium transition-colors"
        >
          Sign in
        </a>
      </p>
    </div>
  );
}

function AccountStep({
  onComplete,
  onError,
}: {
  onComplete: (data: AccountInput) => void;
  onError: () => void;
}) {
  const form = useForm<AccountInput>({
    resolver: zodResolver(registerStepSchemas.account),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    onComplete(data);
  });

  return (
    <div className="space-y-6">
      <div>
        <span
          className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#e07850]/10 text-[#e07850] text-[11px] font-bold tracking-[0.15em] mb-4"
          style={{ fontFamily: 'var(--font-jetbrains-mono)' }}
        >
          ACCOUNT
        </span>
        <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-montserrat)' }}>
          Create your account
        </h2>
        <p className="text-[#a09890] text-sm">Enter your details to get started</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Full Name" error={form.formState.errors.name?.message}>
          <FormInput
            {...form.register('name', { onChange: onError })}
            placeholder="John Smith"
            error={!!form.formState.errors.name}
          />
        </FormField>

        <FormField label="Email" error={form.formState.errors.email?.message}>
          <FormInput
            {...form.register('email', { onChange: onError })}
            type="email"
            placeholder="you@example.com"
            error={!!form.formState.errors.email}
          />
        </FormField>

        <FormField label="Password" error={form.formState.errors.password?.message}>
          <FormInput
            {...form.register('password', { onChange: onError })}
            type="password"
            placeholder="••••••••"
            error={!!form.formState.errors.password}
          />
        </FormField>

        <FormField label="Confirm Password" error={form.formState.errors.confirmPassword?.message}>
          <FormInput
            {...form.register('confirmPassword', { onChange: onError })}
            type="password"
            placeholder="••••••••"
            error={!!form.formState.errors.confirmPassword}
          />
        </FormField>

        <button
          type="submit"
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#e07850] to-[#c8a070] text-[#1a1208] text-sm font-bold hover:shadow-lg hover:shadow-[#e07850]/20 transition-all duration-300 hover:-translate-y-0.5"
        >
          Continue
        </button>
      </form>
    </div>
  );
}

function BusinessStep({
  onComplete,
  onBack,
  onError,
}: {
  onComplete: (data: BusinessInput) => void;
  onBack: () => void;
  onError: () => void;
}) {
  const form = useForm<BusinessInput>({
    resolver: zodResolver(registerStepSchemas.business),
    defaultValues: { businessName: '', businessType: 'cafe', city: '', timezone: 'UTC' },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    onComplete(data);
  });

  return (
    <div className="space-y-6">
      <div>
        <span
          className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#c8a070]/10 text-[#c8a070] text-[11px] font-bold tracking-[0.15em] mb-4"
          style={{ fontFamily: 'var(--font-jetbrains-mono)' }}
        >
          BUSINESS
        </span>
        <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-montserrat)' }}>
          Your business
        </h2>
        <p className="text-[#a09890] text-sm">Tell us about your cafe or restaurant</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Business Name" error={form.formState.errors.businessName?.message}>
          <FormInput
            {...form.register('businessName', { onChange: onError })}
            placeholder="The Cozy Bean"
            error={!!form.formState.errors.businessName}
          />
        </FormField>

        <FormField label="Business Type" error={form.formState.errors.businessType?.message}>
          <FormSelect
            {...form.register('businessType', { onChange: onError })}
            options={BUSINESS_TYPES}
            error={!!form.formState.errors.businessType}
          />
        </FormField>

        <FormField label="City" error={form.formState.errors.city?.message}>
          <FormInput
            {...form.register('city', { onChange: onError })}
            placeholder="Seattle"
            error={!!form.formState.errors.city}
          />
        </FormField>

        <FormField label="Timezone" error={form.formState.errors.timezone?.message}>
          <FormSelect
            {...form.register('timezone', { onChange: onError })}
            options={TIMEZONES}
            error={!!form.formState.errors.timezone}
          />
        </FormField>

        <div className="flex gap-4 mt-8">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 py-3 px-4 rounded-xl border border-white/[0.08] text-[#a09890] text-sm font-medium hover:bg-white/[0.04] hover:border-white/[0.15] hover:text-white transition-all duration-300"
          >
            Back
          </button>
          <button
            type="submit"
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#e07850] to-[#c8a070] text-[#1a1208] text-sm font-bold hover:shadow-lg hover:shadow-[#e07850]/20 transition-all duration-300 hover:-translate-y-0.5"
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  );
}

function CompetitorsStep({
  onComplete,
  onBack,
  onError,
  loading,
}: {
  onComplete: (urls: string[]) => void;
  onBack: () => void;
  onError: () => void;
  loading: boolean;
}) {
  const form = useForm<CompetitorsInput>({
    resolver: zodResolver(registerStepSchemas.competitors),
    defaultValues: { urls: [''] },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    onComplete(data.urls.filter((url) => url.trim() !== ''));
  });

  const urls = form.watch('urls');

  const addUrl = () => {
    form.setValue('urls', [...urls, '']);
  };

  const removeUrl = (index: number) => {
    if (urls.length > 1) {
      form.setValue(
        'urls',
        urls.filter((_, i) => i !== index)
      );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <span
          className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#f5dcc8]/10 text-[#f5dcc8] text-[11px] font-bold tracking-[0.15em] mb-4"
          style={{ fontFamily: 'var(--font-jetbrains-mono)' }}
        >
          COMPETITORS
        </span>
        <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-montserrat)' }}>
          Competitor tracking
        </h2>
        <p className="text-[#a09890] text-sm">Add competitor websites to monitor their prices and promotions</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {urls.map((_, index) => (
          <div key={index} className="flex gap-2">
            <FormField className="flex-1" error={index === 0 ? form.formState.errors.urls?.message : undefined}>
              <FormInput
                {...form.register(`urls.${index}`, { onChange: onError })}
                placeholder="https://competitor-cafe.com"
                error={!!form.formState.errors.urls?.[index]}
              />
            </FormField>
            {urls.length > 1 && (
              <button
                type="button"
                onClick={() => removeUrl(index)}
                className="px-3 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-[#a09890] hover:text-red-400 hover:border-red-500/30 transition-all self-start"
              >
                ✕
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={addUrl}
          className="w-full py-3 rounded-xl border border-dashed border-white/[0.12] text-[#e07850] text-sm font-medium hover:bg-[#e07850]/5 hover:border-[#e07850]/30 transition-all"
        >
          + Add another competitor
        </button>

        <p className="text-xs text-[#a09890]">
          You can skip this for now and add competitors later from your dashboard.
        </p>

        <div className="flex gap-4 mt-8">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 py-3 px-4 rounded-xl border border-white/[0.08] text-[#a09890] text-sm font-medium hover:bg-white/[0.04] hover:border-white/[0.15] hover:text-white transition-all duration-300"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#e07850] to-[#c8a070] text-[#1a1208] text-sm font-bold hover:shadow-lg hover:shadow-[#e07850]/20 disabled:opacity-50 transition-all duration-300 hover:-translate-y-0.5"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </div>
      </form>
    </div>
  );
}
