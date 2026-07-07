import { NextRequest, NextResponse } from 'next/server';
import { handleError } from '@/lib/handlers/errors';

type RouteContext = { params: Promise<Record<string, string>> };
type RouteHandler<T extends RouteContext = RouteContext> = (
  request: NextRequest,
  context: T
) => Promise<NextResponse>;

export function withErrorHandling<T extends RouteContext>(
  handler: RouteHandler<T>
): RouteHandler<T> {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      return handleError(error) as NextResponse;
    }
  };
}
