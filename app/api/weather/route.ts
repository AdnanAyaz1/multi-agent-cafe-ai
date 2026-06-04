import { NextRequest, NextResponse } from 'next/server';
import { getWeatherData } from '@/lib/agents/weather-agent';
import { weatherRequestSchema } from '@/lib/validators/weather';
import { apiHandler } from '@/lib/api/handler';
import { AgentError, ValidationError } from '@/lib/errors';

export const POST = apiHandler(async (request: NextRequest) => {
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
});
