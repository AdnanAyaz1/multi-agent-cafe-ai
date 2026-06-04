import { NextRequest, NextResponse } from 'next/server';
import { getWeatherData } from '@/lib/agents/weather-agent';

export async function POST(request: NextRequest) {
  const { city } = await request.json();

  if (!city || typeof city !== 'string') {
    return NextResponse.json({ error: 'City is required' }, { status: 400 });
  }

  const result = await getWeatherData(city.trim());
  const status = result.error ? 500 : 200;

  return NextResponse.json(result, { status });
}
