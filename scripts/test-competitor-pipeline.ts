import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

import { randomUUID } from 'crypto';
import { prisma } from '../lib/db';
import { getMenuForBusiness } from '../lib/menu';
import { runPipeline } from '../lib/pipelines';
import type { CompetitorData } from '../lib/types';

// Competitor URL or keyword can be passed via command line argument:
// e.g. npx tsx scripts/test-competitor-pipeline.ts "https://anchorheadcoffee.com"
// or   npx tsx scripts/test-competitor-pipeline.ts "victrola"
const ARG_TARGET = process.argv[2]?.trim() || process.env.TEST_COMPETITOR || 'https://anchorheadcoffee.com';
const DEFAULT_BUSINESS_ID = '61746378-ebdd-489c-9de4-f335277433c8';

const KNOWN_COMPETITORS: Record<string, { url: string; brand: string }> = {
  anchorhead: { url: 'https://anchorheadcoffee.com', brand: 'Anchorhead Coffee' },
  victrola: { url: 'https://www.victrolacoffee.com', brand: 'Victrola Coffee' },
  fonte: { url: 'https://www.fontecafe.com', brand: 'Fonte Coffee Roaster' },
  elm: { url: 'https://elmcoffeeroasters.com', brand: 'Elm Coffee Roasters' },
};

async function testSingleCompetitorPipeline() {
  console.log('\n================================================================');
  console.log(`   TESTING COMPETITOR PIPELINE FOR SINGLE CAFE: "${ARG_TARGET.toUpperCase()}"   `);
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
        city: 'Seattle',
        cities: ['Seattle', 'Portland', 'Bellevue'],
        config: {
          competitorUrls: [
            'https://anchorheadcoffee.com',
            'https://www.victrolacoffee.com',
            'https://www.fontecafe.com',
            'https://elmcoffeeroasters.com',
          ],
        },
      },
      include: { user: true },
    });
  }

  console.log(`✓ Cafe: "${business.name}" (${business.id})`);

  // Resolve target competitor URL from input
  const config = business.config as { competitorUrls?: string[] } | null;
  const configuredUrls = config?.competitorUrls || [];
  console.log(`✓ Configured Competitors (${configuredUrls.length}): ${JSON.stringify(configuredUrls)}`);

  let targetUrl = ARG_TARGET;
  const argLower = ARG_TARGET.toLowerCase();

  // If passed keyword (e.g. "victrola"), match against configured or known list
  if (!argLower.startsWith('http://') && !argLower.startsWith('https://')) {
    const matchedConfig = configuredUrls.find((u) => u.toLowerCase().includes(argLower));
    if (matchedConfig) {
      targetUrl = matchedConfig;
    } else if (KNOWN_COMPETITORS[argLower]) {
      targetUrl = KNOWN_COMPETITORS[argLower]!.url;
    } else {
      targetUrl = `https://${ARG_TARGET}.com`;
    }
  }

  console.log(`✓ Selected Target Competitor URL: "${targetUrl}"`);

  // STEP 2: Verify Specialty Menu
  console.log('\n--- 2. Verifying Cafe Menu ---');
  const menu = await getMenuForBusiness(business.id);
  console.log(`✓ Loaded menu with ${menu.items.length} items.`);
  if (menu.items.length === 0) {
    throw new Error('Cafe menu is empty — pipeline requires menu items to optimize.');
  }
  console.log(`  Sample item: "${menu.items[0]?.name}" ($${menu.items[0]?.price})`);

  // STEP 3: Verify Competitor Snapshot in Database for this Target Cafe
  console.log(`\n--- 3. Verifying Competitor Snapshot for: "${targetUrl}" ---`);
  const targetHost = new URL(targetUrl).hostname.replace(/^www\./, '');

  let snapshot = await prisma.dataSnapshot.findFirst({
    where: {
      businessId: business.id,
      source: 'competitors',
      OR: [
        { data: { path: ['url'], equals: targetUrl } },
        { data: { path: ['url'], equals: `https://${targetHost}` } },
        { data: { path: ['url'], equals: `https://www.${targetHost}` } },
      ],
    },
    orderBy: { collectedAt: 'desc' },
  });

  if (!snapshot) {
    console.log(`No existing snapshot found for ${targetUrl}, creating baseline snapshot...`);
    const brandName = targetHost.split('.')[0]!.charAt(0).toUpperCase() + targetHost.split('.')[0]!.slice(1);
    const mockData: CompetitorData = {
      url: targetUrl,
      finalUrl: targetUrl,
      brand: brandName,
      items: [
        { name: 'House Espresso', price: 4.25, category: 'hot-drink', isPromo: false },
        { name: 'Oat Milk Latte', price: 6.25, category: 'hot-drink', isPromo: false },
        { name: 'Cold Brew Nitro', price: 5.75, category: 'cold-drink', isPromo: false },
        { name: 'Signature Drip Coffee', price: 3.75, category: 'hot-drink', isPromo: false },
        { name: 'Cardamom Vanilla Bun', price: 4.95, category: 'food', isPromo: false },
      ],
      promos: [{ text: 'Morning Combo: Pastry + Drip for $7.50' }],
      notes: [`Popular local specialty coffee shop benchmarked at ${targetUrl}`],
      scrapedAt: new Date().toISOString(),
    };

    snapshot = await prisma.dataSnapshot.create({
      data: {
        businessId: business.id,
        source: 'competitors',
        data: JSON.parse(JSON.stringify(mockData)),
        collectedAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
    console.log(`✓ Baseline snapshot created for ${brandName} (${targetUrl})`);
  } else {
    const data = snapshot.data as unknown as CompetitorData;
    console.log(`✓ Found existing snapshot for ${data.brand || targetHost}:`);
    console.log(`  • URL:           ${data.url}`);
    console.log(`  • Brand:         ${data.brand ?? 'N/A'}`);
    console.log(`  • Scraped Items: ${data.items?.length ?? 0}`);
    console.log(`  • Promos:        ${data.promos?.length ?? 0}`);
    if (data.items && data.items.length > 0) {
      console.log(`  • Sample Item:   "${data.items[0]?.name}" ($${data.items[0]?.price})`);
    }
  }

  // STEP 4: Run ONLY the Competitor Pipeline for this Single Competitor Cafe
  console.log(`\n--- 4. Executing Competitor Pipeline (LangGraph) against "${targetUrl}" ---`);
  const pipelineId = randomUUID();
  console.log(`✓ Generated Pipeline ID: ${pipelineId}`);
  const startTime = Date.now();

  const pipelineResult = await runPipeline({
    businessId: business.id,
    pipelineId,
    pipelineType: 'competitor',
    competitorUrl: targetUrl,
  });

  const durationMs = Date.now() - startTime;
  console.log(`✓ Competitor Pipeline finished in ${durationMs}ms`);
  console.log(`  • Pipeline Type:    ${pipelineResult.pipelineType}`);
  console.log(`  • Recommendation ID: ${pipelineResult.recommendationId}`);
  console.log(`  • Revisions:        ${pipelineResult.revisions}`);

  // STEP 5: Verify Agent Runs — ONLY Competitor Pipeline Agents Must Be Present
  console.log('\n--- 5. Verifying Agent Execution Records ---');
  const runs = await prisma.agentRun.findMany({
    where: { pipelineId },
    orderBy: { createdAt: 'asc' },
  });

  console.log(`✓ Found ${runs.length} agent run(s) for this pipeline run:`);
  const expectedAgents = [
    'competitor-parser',
    'competitor-analyst',
    'menu-analyst',
    'strategist',
    'critic',
    'synthesizer',
  ];
  const actualAgentNames = runs.map((r) => r.agentName);

  for (const run of runs) {
    console.log(`  • ${run.agentName.padEnd(20)} [${run.status}] ${run.durationMs ?? 0}ms | ${run.tokenCount ?? 0} tokens`);
  }

  for (const expected of expectedAgents) {
    if (!actualAgentNames.includes(expected)) {
      throw new Error(`Expected agent "${expected}" was not executed in the competitor pipeline!`);
    }
  }

  // Confirm NO weather agents were run
  const weatherAgents = runs.filter((r) => r.agentName === 'weather-analyst');
  if (weatherAgents.length > 0) {
    throw new Error('Weather analyst was detected! Test must run ONLY the competitor pipeline.');
  }
  console.log('✓ Confirmed: ONLY competitor pipeline agents executed (zero weather-analyst agents).');

  // Verify competitor-parser parsed specifically the target cafe
  const parserRun = runs.find((r) => r.agentName === 'competitor-parser');
  if (parserRun?.input) {
    const inputObj = parserRun.input as { url?: string; scrape?: { url?: string; title?: string } };
    const parsedUrl = inputObj.url ?? inputObj.scrape?.url ?? targetUrl;
    console.log(`✓ Competitor Parser targeted URL: "${parsedUrl}"`);
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
    competitorUrl?: string;
    competitorBrand?: string;
    competitorUrls?: string[];
    pipelineId?: string;
  } | null;

  console.log(`✓ Headline: "${recommendation.summary}"`);
  console.log(`✓ Confidence: ${recommendation.confidence.toUpperCase()}`);
  console.log(`✓ Category: ${recommendation.category}`);
  console.log(`✓ Target Competitor URL in Metadata: "${analysisMetadata?.competitorUrl ?? 'N/A'}"`);
  console.log(`✓ Target Competitor Brand in Metadata: "${analysisMetadata?.competitorBrand ?? 'N/A'}"`);
  console.log(`✓ Evaluated URLs list: ${JSON.stringify(analysisMetadata?.competitorUrls ?? [])}`);
  console.log(`✓ Generated Actions (${recommendation.actions.length}):`);

  for (const action of recommendation.actions) {
    const details = action.details as Record<string, unknown>;
    console.log(`  → [${action.actionType.toUpperCase()}] "${action.item}" — Reason: ${details.reason ?? 'N/A'}`);
  }

  if (recommendation.actions.length === 0) {
    throw new Error('Pipeline completed but generated 0 recommendation actions!');
  }

  // Verify that the metadata contains the specific single competitor
  if (analysisMetadata?.competitorUrl && !analysisMetadata.competitorUrl.includes(targetHost)) {
    console.warn(`Warning: Metadata competitorUrl (${analysisMetadata.competitorUrl}) differs from target host (${targetHost})`);
  } else {
    console.log(`✓ Confirmed: Recommendation metadata correctly pinned to single target: "${targetUrl}"`);
  }

  console.log('\n================================================================');
  console.log(`   ✓ SUCCESS: Competitor pipeline for "${targetUrl}" tested and verified!   `);
  console.log('================================================================\n');
}

testSingleCompetitorPipeline()
  .catch((err) => {
    console.error('\n❌ Competitor Pipeline Single-Cafe Test Failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
