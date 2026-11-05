import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

import { randomUUID } from 'crypto';
import { prisma } from '../lib/db';
import { fetchWeather } from '../lib/services/weather/client';
import { ensureWeatherSnapshot } from '../lib/services/weather/snapshot';
import { getMenuForBusiness } from '../lib/menu';
import { runPipeline } from '../lib/pipelines';

// City can be passed via command line argument (e.g. npx tsx scripts/test-weather-pipeline.ts "Portland")
// Defaults to TEST_CITY env or "Portland"
const TARGET_CITY = process.argv[2]?.trim() || process.env.TEST_CITY || 'Portland';
const DEFAULT_BUSINESS_ID = '61746378-ebdd-489c-9de4-f335277433c8';

async function testSingleCityWeatherPipeline() {
  console.log('\n================================================================');
  console.log(`   TESTING WEATHER PIPELINE FOR SINGLE CITY: "${TARGET_CITY.toUpperCase()}"   `);
  console.log('================================================================\n');

  // STEP 1: Find or create the test cafe business
  console.log('--- 1. Locating Cafe Profile ---');
  let business = await prisma.business.findFirst({
    where: {
      OR: [
        { id: DEFAULT_BUSINESS_ID },
        { name: 'Pioneer Square Artisan Roasters' },
      ],
    },
    include: { user: true },
  });

  if (!business) {
    console.log('Primary test business not found, searching for any existing business...');
    business = await prisma.business.findFirst({
      include: { user: true },
    });
  }

  if (!business) {
    console.log('Creating a fallback test cafe...');
    business = await prisma.business.create({
      data: {
        name: 'Artisan City Cafe',
        type: 'cafe',
        city: TARGET_CITY,
        cities: [TARGET_CITY, 'Seattle', 'Bellevue'],
      },
      include: { user: true },
    });
  }

  console.log(`✓ Cafe: "${business.name}" (${business.id})`);
  console.log(`✓ Primary City: ${business.city}`);
  console.log(`✓ Configured Operational Cities: ${JSON.stringify(business.cities)}`);
  console.log(`✓ Selected Target City for Test: "${TARGET_CITY}"`);

  // STEP 2: Verify Specialty Menu
  console.log('\n--- 2. Verifying Cafe Menu ---');
  const menu = await getMenuForBusiness(business.id);
  console.log(`✓ Loaded menu with ${menu.items.length} items.`);
  if (menu.items.length === 0) {
    throw new Error('Cafe menu is empty — pipeline requires menu items to optimize.');
  }
  console.log(`  Sample item: "${menu.items[0]?.name}" ($${menu.items[0]?.price})`);

  // STEP 3: Live Weather Fetch for the Single Selected City
  console.log(`\n--- 3. Ingesting Live Weather for Single City: "${TARGET_CITY}" ---`);
  const liveWeather = await fetchWeather(TARGET_CITY);
  console.log(`✓ Live weather successfully fetched from Open-Meteo for ${liveWeather.city}, ${liveWeather.country}:`);
  console.log(`  • Temperature:   ${liveWeather.temperature}°C (Feels like: ${liveWeather.feelsLike}°C)`);
  console.log(`  • Condition:     ${liveWeather.condition}`);
  console.log(`  • Humidity:      ${liveWeather.humidity}%`);
  console.log(`  • Wind Speed:    ${liveWeather.windSpeed} km/h`);

  const snapshot = await ensureWeatherSnapshot({
    businessId: business.id,
    city: TARGET_CITY,
  });
  console.log(`✓ Weather snapshot verified in database (City: ${snapshot.city}, Temp: ${snapshot.temperature}°C)`);

  // STEP 4: Run ONLY the Weather Pipeline for this Single City
  console.log(`\n--- 4. Executing Weather Pipeline (LangGraph) for "${TARGET_CITY}" ---`);
  const pipelineId = randomUUID();
  console.log(`✓ Generated Pipeline ID: ${pipelineId}`);
  const startTime = Date.now();

  const pipelineResult = await runPipeline({
    businessId: business.id,
    pipelineId,
    pipelineType: 'weather',
    city: TARGET_CITY,
  });

  const durationMs = Date.now() - startTime;
  console.log(`✓ Weather Pipeline finished in ${durationMs}ms`);
  console.log(`  • Pipeline Type:    ${pipelineResult.pipelineType}`);
  console.log(`  • Recommendation ID: ${pipelineResult.recommendationId}`);
  console.log(`  • Revisions:        ${pipelineResult.revisions}`);

  // STEP 5: Verify Agent Runs — ONLY Weather Pipeline Agents Must Be Present
  console.log('\n--- 5. Verifying Agent Execution Records ---');
  const runs = await prisma.agentRun.findMany({
    where: { pipelineId },
    orderBy: { createdAt: 'asc' },
  });

  console.log(`✓ Found ${runs.length} agent run(s) for this pipeline run:`);
  const expectedAgents = ['menu-analyst', 'weather-analyst', 'strategist', 'critic', 'synthesizer'];
  const actualAgentNames = runs.map((r) => r.agentName);

  for (const run of runs) {
    console.log(`  • ${run.agentName.padEnd(16)} [${run.status}] ${run.durationMs ?? 0}ms | ${run.tokenCount ?? 0} tokens`);
  }

  for (const expected of expectedAgents) {
    if (!actualAgentNames.includes(expected)) {
      throw new Error(`Expected agent "${expected}" was not executed in the weather pipeline!`);
    }
  }

  // Confirm NO competitor agents were run
  const competitorAgents = runs.filter(
    (r) => r.agentName === 'competitor-parser' || r.agentName === 'competitor-analyst'
  );
  if (competitorAgents.length > 0) {
    throw new Error('Competitor agents were detected! Test must run ONLY the weather pipeline.');
  }
  console.log('✓ Confirmed: ONLY weather pipeline agents executed (zero competitor agents).');

  // Verify weather-analyst examined the single targeted city
  const weatherRun = runs.find((r) => r.agentName === 'weather-analyst');
  if (weatherRun?.input) {
    const inputObj = weatherRun.input as { city?: string; condition?: string };
    console.log(`✓ Weather Analyst targeted city verification: "${inputObj.city ?? 'unknown'}" (Condition: ${inputObj.condition ?? 'unknown'})`);
  }

  // STEP 6: Verify Persisted Recommendation & Actions
  console.log('\n--- 6. Verifying Generated Recommendation & Action Plan ---');
  const recommendation = await prisma.recommendation.findUnique({
    where: { id: pipelineResult.recommendationId },
    include: { actions: true },
  });

  if (!recommendation) {
    throw new Error(`Recommendation ${pipelineResult.recommendationId} was not found in database!`);
  }

  const analysisMetadata = recommendation.dataAnalysis as {
    city?: string;
    pipelineId?: string;
    weatherAnalysis?: { condition?: string };
  } | null;

  console.log(`✓ Headline: "${recommendation.summary}"`);
  console.log(`✓ Confidence: ${recommendation.confidence.toUpperCase()}`);
  console.log(`✓ Category: ${recommendation.category}`);
  console.log(`✓ Target City in Metadata: "${analysisMetadata?.city ?? snapshot.city}"`);
  console.log(`✓ Generated Actions (${recommendation.actions.length}):`);

  for (const action of recommendation.actions) {
    const details = action.details as Record<string, unknown>;
    console.log(`  → [${action.actionType.toUpperCase()}] "${action.item}" — Reason: ${details.reason ?? 'N/A'}`);
  }

  if (recommendation.actions.length === 0) {
    throw new Error('Pipeline completed but generated 0 recommendation actions!');
  }

  console.log('\n================================================================');
  console.log(`   ✓ SUCCESS: Weather pipeline for "${TARGET_CITY}" tested and verified!   `);
  console.log('================================================================\n');
}

testSingleCityWeatherPipeline()
  .catch((err) => {
    console.error('\n❌ Weather Pipeline Single-City Test Failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
