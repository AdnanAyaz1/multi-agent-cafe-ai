import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  typescript: true,
});

export const STRIPE_PLANS = {
  starter: { name: 'Starter', priceId: null, price: 0 },
  growth: { name: 'Growth', priceId: process.env.STRIPE_GROWTH_PRICE_ID ?? '', price: 4900 },
  enterprise: { name: 'Enterprise', priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID ?? '', price: 19900 },
} as const;

export type PlanKey = keyof typeof STRIPE_PLANS;
