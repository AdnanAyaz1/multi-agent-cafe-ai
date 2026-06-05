import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AppError, ValidationError } from '@/lib/errors';
import { logger } from '@/lib/logger';

const log = logger.child('api');

/**
 * Wraps a Next.js route handler in a try/catch that converts known errors
 * into structured JSON responses and logs anything else as a 500.
 *
 * Recognised error sources:
 *   - AppError subclasses  → statusCode + code + details from the error
 *   - ZodError             → 400 with flattened field issues
 *   - anything else        → 500, message exposed, full error logged
 *
 * Usage:
 *   export const POST = withApiHandler(async (request: NextRequest) => {
 *     const body = await parseJsonBody(request);
 *     const { city } = weatherRequestSchema.parse(body);
 *     return NextResponse.json({ city });
 *   });
 */
export function withApiHandler<TArgs extends unknown[]>(
  fn: (...args: TArgs) => Promise<NextResponse>
): (...args: TArgs) => Promise<NextResponse> {
  return async (...args: TArgs): Promise<NextResponse> => {
    try {
      return await fn(...args);
    } catch (error) {
      return errorResponse(error);
    }
  };
}

/**
 * Parses a JSON request body. Throws ValidationError (→ 400) if the body
 * is not valid JSON. The HOF turns it into the right response shape.
 */
export async function parseJsonBody(request: NextRequest): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new ValidationError('Invalid JSON body');
  }
}

function errorResponse(error: unknown): NextResponse {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        ...(error.details !== undefined ? { details: error.details } : {}),
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.flatten(),
      },
      { status: 400 }
    );
  }

  log.error('unhandled', error);
  const message =
    error instanceof Error ? error.message : 'Internal server error';
  return NextResponse.json(
    { error: message, code: 'INTERNAL_ERROR' },
    { status: 500 }
  );
}
