import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { stripe, STRIPE_PLANS, type PlanKey } from '@/lib/stripe';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

const log = logger.child('stripe-checkout');

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

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: planConfig.priceId, quantity: 1 }],
      success_url: `${baseUrl}/dashboard/settings?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/dashboard/settings`,
      metadata: { userId: user.id, plan },
      subscription_data: {
        trial_period_days: 14,
        metadata: { userId: user.id, plan },
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    log.error('Failed to create checkout session', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
