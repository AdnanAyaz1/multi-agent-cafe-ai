import { NextRequest, NextResponse } from 'next/server';
import { getWeatherData } from '@/lib/agents/weather-agent';
import { weatherRequestSchema } from '@/lib/validators/weather';
import { parseBody } from '@/lib/validators';
import { AgentError } from '@/lib/errors';
import handleError from '@/lib/handlers/errors';

export async function POST(request: NextRequest) {
  try {
    const { city } = await parseBody(request, weatherRequestSchema);

    const result = await getWeatherData(city);

    if (result.error) {
      throw new AgentError(result.error);
    }

    return NextResponse.json(result);
  } catch (error) {
    return handleError(error) as NextResponse;
  }
}
