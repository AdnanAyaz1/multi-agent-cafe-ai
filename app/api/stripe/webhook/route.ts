import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

const log = logger.child('stripe-webhook');

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET ?? '');
  } catch (err) {
    log.error('Webhook signature verification failed', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  log.info(`Received: ${event.type}`);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan;

        if (userId && plan) {
          await prisma.subscription.upsert({
            where: { userId },
            update: {
              plan,
              status: 'active',
              stripeId: session.customer as string,
              stripeSubscriptionId: session.subscription as string,
            },
            create: {
              userId,
              plan,
              status: 'active',
              stripeId: session.customer as string,
              stripeSubscriptionId: session.subscription as string,
            },
          });
          log.info(`Activated plan "${plan}" for user ${userId}`);
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;
        const subId = subscription.id;

        if (userId) {
          const status = mapStripeStatus(subscription.status);
          const subObj = subscription as unknown as { current_period_end?: number };
          const periodEnd = subObj.current_period_end;
          await prisma.subscription.update({
            where: { userId },
            data: {
              status,
              stripeSubscriptionId: subId,
              endDate: periodEnd ? new Date(periodEnd * 1000) : undefined,
            },
          });
          log.info(`Updated subscription for user ${userId}: status=${status}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (userId) {
          await prisma.subscription.update({
            where: { userId },
            data: {
              plan: 'free',
              status: 'active',
              stripeSubscriptionId: null,
              endDate: null,
            },
          });
          log.info(`Downgraded user ${userId} to free`);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const invoiceObj = invoice as unknown as { subscription?: string };
        const subId = invoiceObj.subscription;

        if (subId) {
          const sub = await stripe.subscriptions.retrieve(subId);
          const userId = sub.metadata?.userId;

          if (userId) {
            await prisma.subscription.update({
              where: { userId },
              data: { status: 'past_due' },
            });
          }
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    log.error('Handler error', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

function mapStripeStatus(status: Stripe.Subscription.Status): string {
  switch (status) {
    case 'active':
    case 'trialing':
      return 'active';
    case 'past_due':
      return 'past_due';
    case 'canceled':
    case 'unpaid':
      return 'canceled';
    default:
      return 'active';
  }
}
