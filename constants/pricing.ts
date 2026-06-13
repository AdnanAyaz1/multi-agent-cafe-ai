export interface Plan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  href: string | null;
  planKey: 'growth' | 'enterprise' | null;
  popular: boolean;
}

export const PRICING_PLANS: Plan[] = [
  {
    name: 'Starter',
    price: '0',
    period: 'forever',
    description: 'For cafes just getting started with AI.',
    features: ['1 AI Agent', 'Daily weather analysis', 'Basic recommendations', 'Email support'],
    cta: 'Get Started Free',
    href: '/auth/register',
    planKey: null,
    popular: false,
  },
  {
    name: 'Growth',
    price: '49',
    period: '/month',
    description: 'For cafes ready to maximize revenue.',
    features: ['5 AI Agents', 'Competitor tracking', 'Advanced pricing engine', 'Auto-approve changes', 'Priority support', 'Weekly reports'],
    cta: 'Start Free Trial',
    href: null,
    planKey: 'growth',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: '199',
    period: '/month',
    description: 'For multi-location cafe chains.',
    features: ['Unlimited AI Agents', 'Custom AI training', 'API access', 'Multi-location dashboard', 'Dedicated account manager', 'Custom integrations'],
    cta: 'Contact Sales',
    href: null,
    planKey: 'enterprise',
    popular: false,
  },
];
