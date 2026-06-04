import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { getWeatherData } from '@/lib/agents/weather-agent';
import { weatherRequestSchema } from '@/lib/validators/weather';
import { AgentError, AppError, ValidationError } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new ValidationError('Invalid JSON body');
    }

    const { city } = weatherRequestSchema.parse(body);

    const result = await getWeatherData(city);

    if (result.error) {
      throw new AgentError(result.error);
    }

    return NextResponse.json(result);
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
