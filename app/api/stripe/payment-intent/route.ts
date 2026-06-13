import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { stripe, STRIPE_PLANS, type PlanKey } from '@/lib/stripe';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

const log = logger.child('stripe-payment-intent');

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan } = (await req.json()) as { plan: PlanKey };
    const planConfig = STRIPE_PLANS[plan];

    if (!planConfig || !planConfig.priceId) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { subscription: true },
    });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let customerId = user.subscription?.stripeId;

    if (!customerId) {
      const stripeCustomer = await stripe.customers.create({
        email: user.email,
        name: user.name ?? undefined,
        metadata: { userId: user.id },
      });
      customerId = stripeCustomer.id;

      await prisma.subscription.upsert({
        where: { userId: user.id },
        update: { stripeId: customerId },
        create: {
          userId: user.id,
          plan: 'free',
          status: 'active',
          stripeId: customerId,
        },
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: planConfig.price,
      currency: 'usd',
      customer: customerId,
      automatic_payment_methods: { enabled: true },
      metadata: { userId: user.id, plan },
      description: `CafePromo AI - ${planConfig.name} Plan (Monthly)`,
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    log.error('Failed to create payment', error);
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
  }
}
