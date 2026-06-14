import type { ReactNode } from 'react';

export interface UpgradeBannerProps {
  feature: string;
  requiredPlan?: 'growth' | 'enterprise';
}

export interface FormFieldProps {
  label?: string;
  error?: string;
  children: ReactNode;
  className?: string;
  mono?: boolean;
}

export interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  options: { value: string; label: string }[];
}

export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}
