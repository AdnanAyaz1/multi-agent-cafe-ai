import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db';

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const existing = await prisma.subscription.findUnique({ where: { userId } });
    if (existing && existing.plan !== 'free' && existing.stripeSubscriptionId) {
      return NextResponse.json({ status: 'active', plan: existing.plan });
    }

    const sub = await prisma.subscription.findUnique({ where: { userId } });
    const customerId = sub?.stripeId;

    if (!customerId) {
      return NextResponse.json({ status: 'free' });
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return NextResponse.json({ status: 'free' });
    }

    const stripeSub = subscriptions.data[0];
    const plan = stripeSub.items.data[0]?.price?.id === process.env.STRIPE_GROWTH_PRICE_ID ? 'growth' : 'enterprise';

    await prisma.subscription.upsert({
      where: { userId },
      update: {
        plan,
        status: 'active',
        stripeSubscriptionId: stripeSub.id,
      },
      create: {
        userId,
        plan,
        status: 'active',
        stripeId: customerId,
        stripeSubscriptionId: stripeSub.id,
      },
    });

    console.log(`[Verify] Activated plan "${plan}" for user ${userId}`);
    return NextResponse.json({ status: 'active', plan });
  } catch (error) {
    console.error('[Verify] Error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
