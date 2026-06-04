import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { getMenuForBusiness } from '@/lib/menu';
import { AppError } from '@/lib/errors';

export async function GET(
  _request: NextRequest,
  ctx: RouteContext<'/api/menu/[businessId]'>
) {
  try {
    const { businessId } = await ctx.params;
    const menu = await getMenuForBusiness(businessId);
    return NextResponse.json(menu);
  } catch (error) {
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
}
