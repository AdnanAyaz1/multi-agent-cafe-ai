import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;

const accountSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters'),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const businessSchema = z.object({
  businessName: z
    .string()
    .min(1, 'Business name is required'),
  businessType: z
    .string()
    .min(1, 'Business type is required'),
  city: z
    .string()
    .min(1, 'City is required'),
  timezone: z
    .string()
    .min(1, 'Timezone is required'),
});

const competitorsSchema = z.object({
  urls: z
    .array(z.string().url('Invalid URL').or(z.literal('')))
    .min(1, 'Add at least one competitor URL'),
});

const planSchema = z.object({
  plan: z.enum(['free', 'pro', 'enterprise']),
});

export const registerStepSchemas = {
  account: accountSchema,
  business: businessSchema,
  competitors: competitorsSchema,
  plan: planSchema,
} as const;

export type AccountInput = z.infer<typeof accountSchema>;
export type BusinessInput = z.infer<typeof businessSchema>;
export type CompetitorsInput = z.infer<typeof competitorsSchema>;
export type PlanInput = z.infer<typeof planSchema>;

export const registerSchema = z.object({
  ...accountSchema.shape,
  ...businessSchema.shape,
  ...competitorsSchema.shape,
  ...planSchema.shape,
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type RegisterInput = z.infer<typeof registerSchema>;
