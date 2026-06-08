import { NextRequest, NextResponse } from 'next/server';
import { getWeatherData } from '@/lib/agents/weather-agent';
import { weatherRequestSchema } from '@/lib/validators/weather';
import { AgentError, ValidationError } from '@/lib/errors';
import handleError from '@/lib/handlers/errors';

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
    return handleError(error) as NextResponse;
  }
}
