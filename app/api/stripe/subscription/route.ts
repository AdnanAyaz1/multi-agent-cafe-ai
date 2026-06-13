import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

const log = logger.child('stripe-subscription');

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
      select: {
        plan: true,
        status: true,
        startDate: true,
        endDate: true,
        trialEndsAt: true,
      },
    });

    return NextResponse.json({ subscription: subscription ?? { plan: 'free', status: 'active' } });
  } catch (error) {
    log.error('Failed to fetch subscription', error);
    return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 });
  }
}
