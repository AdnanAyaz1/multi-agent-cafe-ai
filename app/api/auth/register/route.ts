import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { promises as fs } from 'fs';
import path from 'path';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { DEFAULT_MENU_ITEMS } from '@/lib/menu/defaults';
import { ValidationError } from '@/lib/errors';
import { withErrorHandling } from '@/lib/api/with-error-handling';
import { z } from 'zod';

const log = logger.child('api:auth/register');

const MENUS_DIR =
  process.env.MENU_JSON_DIR ?? path.join(process.cwd(), 'data', 'menus');

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  business: z.object({
    name: z.string().min(1, 'Business name is required'),
    city: z.string().min(1, 'Business city is required'),
    type: z.string().optional(),
    timezone: z.string().optional(),
  }),
  competitors: z.array(z.string()).optional(),
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new ValidationError('Invalid JSON body');
  }

  const parsed = registerSchema.parse(body);
  const { name, email, password, business, competitors } = parsed;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new ValidationError('Email already registered');
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const createdBusiness = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    await tx.subscription.create({
      data: {
        userId: user.id,
        plan: 'free',
        status: 'active',
      },
    });

    return tx.business.create({
      data: {
        userId: user.id,
        name: business.name,
        type: business.type || 'cafe',
        city: business.city,
        timezone: business.timezone || 'UTC',
        config: {
          competitorUrls: competitors?.filter((url) => url?.trim()) || [],
        },
      },
    });
  });

  try {
    await fs.mkdir(MENUS_DIR, { recursive: true });
    await fs.writeFile(
      path.join(MENUS_DIR, `${createdBusiness.id}.json`),
      JSON.stringify(DEFAULT_MENU_ITEMS, null, 2),
      'utf-8'
    );
  } catch {
    // File write may fail on serverless (read-only fs) — not critical
  }

  log.info('Account created', { userId: createdBusiness.userId });

  return NextResponse.json(
    { message: 'Account created' },
    { status: 201 }
  );
});
