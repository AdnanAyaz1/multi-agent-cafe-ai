import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set');
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      typescript: true,
    });
  }
  return _stripe;
}

export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return (getStripe() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export const STRIPE_PLANS = {
  starter: { name: 'Starter', priceId: null, price: 0 },
  growth: { name: 'Growth', priceId: process.env.STRIPE_GROWTH_PRICE_ID ?? '', price: 4900 },
  enterprise: { name: 'Enterprise', priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID ?? '', price: 19900 },
} as const;

export type PlanKey = keyof typeof STRIPE_PLANS;
