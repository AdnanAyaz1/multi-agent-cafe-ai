import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Queue, QueueEvents } from 'bullmq';
import { randomUUID } from 'crypto';
import 'dotenv/config';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const BUSINESS_ID = process.env.TEST_BUSINESS_ID ?? 'test-biz-1';
const CITY = process.env.TEST_CITY ?? 'Tokyo';

async function main() {
  const biz = await prisma.business.upsert({
    where: { id: BUSINESS_ID },
    update: {},
    create: {
      id: BUSINESS_ID,
      name: 'Test Cafe',
      type: 'cafe',
      city: CITY,
    },
  });
  console.log('[seed] business:', biz.name, biz.city);

  const connection = {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
  };

  await ensureWeatherSnapshot(connection);

  const pipelineId = randomUUID();
  console.log('[pipeline] start:', pipelineId);

  const aiQueue = new Queue('ai-analysis', { connection });
  const aiEvents = new QueueEvents('ai-analysis', { connection });
  await aiEvents.waitUntilReady();

  const job = await aiQueue.add('full-pipeline', {
    businessId: BUSINESS_ID,
    pipelineId,
  });
  console.log('[pipeline] enqueued job:', job.id);

  const result = await job.waitUntilFinished(aiEvents, 5 * 60_000);
  console.log('[pipeline] result:', result);

  const runs = await prisma.agentRun.findMany({
    where: { pipelineId },
    orderBy: { createdAt: 'asc' },
  });
  console.log(`[runs] ${runs.length} agent runs:`);
  for (const r of runs) {
    console.log(
      `  - ${r.agentName} [${r.status}] ${r.durationMs ?? '?'}ms ${r.tokenCount ?? 0}tk`
    );
    if (r.error) console.log(`    ERR: ${r.error}`);
  }

  const rec = await prisma.recommendation.findFirst({
    where: { dataAnalysis: { path: ['pipelineId'], equals: pipelineId } },
    include: { actions: true },
  });
  if (rec) {
    console.log('\n[recommendation]');
    console.log('  summary:', rec.summary);
    console.log('  confidence:', rec.confidence);
    console.log('  actions:', rec.actions.length);
    for (const a of rec.actions) {
      console.log(`    - [${a.actionType}] ${a.item}`);
    }
    console.log('\n[briefing]');
    console.log(rec.reasoning);
  } else {
    console.log('\n[recommendation] NOT SAVED');
  }

  await aiEvents.close();
  await aiQueue.close();
  await prisma.$disconnect();
}

interface Connection {
  host: string;
  port: number;
}

async function ensureWeatherSnapshot(connection: Connection): Promise<void> {
  const fresh = await prisma.dataSnapshot.findFirst({
    where: {
      businessId: BUSINESS_ID,
      source: 'weather',
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    orderBy: { collectedAt: 'desc' },
  });
  if (fresh) {
    console.log('[seed] reusing existing weather snapshot');
    return;
  }

  console.log('[seed] no weather snapshot - enqueueing weather-fetch');
  const queue = new Queue('data-collect', { connection });
  const events = new QueueEvents('data-collect', { connection });
  await events.waitUntilReady();
  const job = await queue.add('weather-fetch', {
    businessId: BUSINESS_ID,
    city: CITY,
  });
  await job.waitUntilFinished(events, 30_000);
  await events.close();
  await queue.close();
  console.log('[seed] weather snapshot ready');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
