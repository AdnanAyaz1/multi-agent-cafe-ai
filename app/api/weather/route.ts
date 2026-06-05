import { NextRequest, NextResponse } from 'next/server';
import { getWeatherData } from '@/lib/agents/weather-agent';
import { weatherRequestSchema } from '@/lib/validators/weather';
import { AgentError } from '@/lib/errors';
import { withApiHandler, parseJsonBody } from '@/lib/api/handler';

export const POST = withApiHandler(async (request: NextRequest) => {
  const body = await parseJsonBody(request);
  const { city } = weatherRequestSchema.parse(body);

  const result = await getWeatherData(city);
  if (result.error) throw new AgentError(result.error);

  return NextResponse.json(result);
});
