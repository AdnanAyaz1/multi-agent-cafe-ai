import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AppError } from '@/lib/errors';

type RouteContext = Record<string, unknown>;

type RouteHandler<C extends RouteContext = RouteContext> = (
  req: NextRequest,
  context: C
) => Promise<NextResponse>;

export function apiHandler<C extends RouteContext = RouteContext>(
  handler: RouteHandler<C>
): RouteHandler<C> {
  return async (req, context) => {
    try {
      return await handler(req, context);
    } catch (error) {
      return errorResponse(error);
    }
  };
}

export function errorResponse(error: unknown): NextResponse {
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

  console.error('Unhandled API error:', error);
  const message =
    error instanceof Error ? error.message : 'Internal server error';

  return NextResponse.json(
    { error: message, code: 'INTERNAL_ERROR' },
    { status: 500 }
  );
}
