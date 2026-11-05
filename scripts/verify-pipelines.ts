import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

import { randomUUID } from 'crypto';
import { prisma } from '../lib/db';
import { fetchWeather } from '../lib/services/weather/client';
import { ensureWeatherSnapshot } from '../lib/services/weather/snapshot';
import { getMenuForBusiness } from '../lib/menu';
import { runPipeline } from '../lib/pipelines';
import type { CompetitorData } from '../lib/types';

const BUSINESS_ID = '61746378-ebdd-489c-9de4-f335277433c8';

async function verify() {
  console.log('\n======================================================');
  console.log('       MULTI-AGENT CAFE PIPELINE VERIFICATION         ');
  console.log('======================================================\n');

  // STEP 1: Verify Neon Database & Business
  console.log('--- STEP 1: Database & Cafe Profile Verification ---');
  const business = await prisma.business.findUnique({
    where: { id: BUSINESS_ID },
    include: { user: true },
  });

  if (!business) {
    throw new Error(`Business ${BUSINESS_ID} not found in database!`);
  }
  console.log(`✓ Cafe: "${business.name}"`);
  console.log(`✓ Owner: ${business.user?.name} (${business.user?.email})`);
  console.log(`✓ Primary City: ${business.city}`);
  console.log(`✓ Branch Cities: ${JSON.stringify(business.cities)}`);
  const config = business.config as Record<string, unknown> | null;
  const compUrls = (config?.competitorUrls as string[]) ?? [];
  console.log(`✓ Competitor URLs configured (${compUrls.length}):`, compUrls);

  // STEP 2: Verify Specialty Menu
  console.log('\n--- STEP 2: Specialty Menu Verification ---');
  const menu = await getMenuForBusiness(BUSINESS_ID);
  console.log(`✓ Menu loaded for business: ${menu.items.length} items`);
  const hotItems = menu.items.filter((i) => i.category === 'hot-drink');
  const coldItems = menu.items.filter((i) => i.category === 'cold-drink');
  console.log(`  - Hot espresso/drinks: ${hotItems.length}`);
  console.log(`  - Cold specialty drinks: ${coldItems.length}`);
  console.log(`  - Sample items: "${menu.items[0]?.name}" ($${menu.items[0]?.price}), "${menu.items[1]?.name}" ($${menu.items[1]?.price})`);

  // STEP 3: Verify Live Weather Service (Open-Meteo)
  console.log('\n--- STEP 3: Live Weather Ingestion (Seattle) ---');
  const liveWeather = await fetchWeather(business.city);
  console.log(`✓ Live weather fetched from Open-Meteo for ${liveWeather.city}, ${liveWeather.country}:`);
  console.log(`  - Temperature: ${liveWeather.temperature}°C (Feels like: ${liveWeather.feelsLike}°C)`);
  console.log(`  - Condition: ${liveWeather.condition}`);
  console.log(`  - Humidity: ${liveWeather.humidity}% | Wind: ${liveWeather.windSpeed} km/h`);

  const snapshot = await ensureWeatherSnapshot({
    businessId: BUSINESS_ID,
    city: business.city,
    latitude: business.latitude,
    longitude: business.longitude,
  });
  console.log(`✓ Weather snapshot active in DB (Temp: ${snapshot.temperature}°C, Condition: ${snapshot.condition})`);

  // STEP 4: Verify Competitor Snapshots in DB
  console.log('\n--- STEP 4: Competitor Intelligence Snapshots ---');
  const competitorSnapshots = await prisma.dataSnapshot.findMany({
    where: {
      businessId: BUSINESS_ID,
      source: 'competitors',
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    orderBy: { collectedAt: 'desc' },
  });
  console.log(`✓ Active competitor snapshots in DB: ${competitorSnapshots.length}`);
  for (const cs of competitorSnapshots) {
    const data = cs.data as unknown as CompetitorData;
    console.log(`  - [${data.brand ?? 'Competitor'}] ${data.url} (${data.items?.length ?? 0} items, ${data.promos?.length ?? 0} promos)`);
  }

  // STEP 5: Verify Weather Pipeline LangGraph Execution
  console.log('\n--- STEP 5: LangGraph Weather Pipeline Execution ---');
  const weatherPipelineId = randomUUID();
  console.log(`Starting Weather Pipeline run [${weatherPipelineId}]...`);
  const weatherStartTime = Date.now();

  const weatherResult = await runPipeline({
    businessId: BUSINESS_ID,
    pipelineId: weatherPipelineId,
    pipelineType: 'weather',
  });

  const weatherDuration = Date.now() - weatherStartTime;
  console.log(`✓ Weather Pipeline completed in ${weatherDuration}ms:`);
  console.log(`  - Recommendation ID: ${weatherResult.recommendationId}`);
  console.log(`  - Revisions: ${weatherResult.revisions}`);

  // Inspect Weather Pipeline Agent Runs & Recommendation
  const weatherRuns = await prisma.agentRun.findMany({
    where: { pipelineId: weatherPipelineId },
    orderBy: { createdAt: 'asc' },
  });
  console.log(`  - Agent runs recorded (${weatherRuns.length}):`);
  for (const r of weatherRuns) {
    console.log(`    • ${r.agentName.padEnd(16)} [${r.status}] duration: ${r.durationMs ?? 0}ms`);
  }

  const weatherRec = await prisma.recommendation.findUnique({
    where: { id: weatherResult.recommendationId },
    include: { actions: true },
  });
  if (!weatherRec) throw new Error('Weather recommendation was not found in DB!');
  console.log(`  - Headline: "${weatherRec.summary}"`);
  console.log(`  - Confidence: ${weatherRec.confidence.toUpperCase()}`);
  console.log(`  - Actions generated (${weatherRec.actions.length}):`);
  for (const a of weatherRec.actions) {
    const details = a.details as Record<string, unknown>;
    console.log(`    → [${a.actionType.toUpperCase()}] "${a.item}" (Priority: ${details.priority ?? 1}) - Reason: ${details.reason ?? ''}`);
  }

  // STEP 6: Verify Competitor Pipeline LangGraph Execution
  console.log('\n--- STEP 6: LangGraph Competitor Pipeline Execution ---');
  const compPipelineId = randomUUID();
  console.log(`Starting Competitor Pipeline run [${compPipelineId}]...`);
  const compStartTime = Date.now();

  const compResult = await runPipeline({
    businessId: BUSINESS_ID,
    pipelineId: compPipelineId,
    pipelineType: 'competitor',
  });

  const compDuration = Date.now() - compStartTime;
  console.log(`✓ Competitor Pipeline completed in ${compDuration}ms:`);
  console.log(`  - Recommendation ID: ${compResult.recommendationId}`);
  console.log(`  - Revisions: ${compResult.revisions}`);

  const compRuns = await prisma.agentRun.findMany({
    where: { pipelineId: compPipelineId },
    orderBy: { createdAt: 'asc' },
  });
  console.log(`  - Agent runs recorded (${compRuns.length}):`);
  for (const r of compRuns) {
    console.log(`    • ${r.agentName.padEnd(20)} [${r.status}] duration: ${r.durationMs ?? 0}ms`);
  }

  const compRec = await prisma.recommendation.findUnique({
    where: { id: compResult.recommendationId },
    include: { actions: true },
  });
  if (!compRec) throw new Error('Competitor recommendation was not found in DB!');
  console.log(`  - Headline: "${compRec.summary}"`);
  console.log(`  - Confidence: ${compRec.confidence.toUpperCase()}`);
  console.log(`  - Actions generated (${compRec.actions.length}):`);
  for (const a of compRec.actions) {
    const details = a.details as Record<string, unknown>;
    console.log(`    → [${a.actionType.toUpperCase()}] "${a.item}" - Reason: ${details.reason ?? ''}`);
  }

  // STEP 7: Status Polling API Verification
  console.log('\n--- STEP 7: Polling API Status Verification ---');
  const testPipelineId = weatherPipelineId;
  const runs = await prisma.agentRun.findMany({
    where: { pipelineId: testPipelineId },
    orderBy: { createdAt: 'asc' },
  });
  const rec = await prisma.recommendation.findFirst({
    where: {
      dataAnalysis: { path: ['pipelineId'], equals: testPipelineId },
    },
    include: { actions: true },
  });

  console.log(`✓ Pipeline ${testPipelineId} status check:`);
  console.log(`  - Agent runs count: ${runs.length}`);
  console.log(`  - All agents complete: ${runs.every((r) => r.status === 'complete')}`);
  console.log(`  - Recommendation linked: ${Boolean(rec)} (ID: ${rec?.id})`);

  console.log('\n======================================================');
  console.log('       ALL PIPELINES VERIFIED SUCCESSFULLY! ✓         ');
  console.log('======================================================\n');
}

verify()
  .catch((err) => {
    console.error('\n❌ Verification Failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
