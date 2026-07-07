import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { UnauthorizedError, NotFoundError } from '@/lib/errors';
import { withErrorHandling } from '@/lib/api/with-error-handling';

export const GET = withErrorHandling(async () => {
  const session = await auth();
  if (!session?.user?.id) throw new UnauthorizedError();

  const business = await prisma.business.findFirst({
    where: { userId: session.user.id },
    select: { id: true, name: true },
  });

  if (!business) throw new NotFoundError('Business');

  return NextResponse.json({ business });
});
