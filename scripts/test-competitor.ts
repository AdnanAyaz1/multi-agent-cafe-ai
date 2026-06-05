import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Queue, QueueEvents } from 'bullmq';
import 'dotenv/config';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const TEST_BUSINESS_ID = process.env.TEST_BUSINESS_ID ?? 'test-biz-1';
const DEFAULT_URLS = [
  'https://example.com/',
];

async function main() {
  const urls = process.argv.slice(2);
  const targets = urls.length > 0 ? urls : DEFAULT_URLS;
  console.log(`Testing competitor scrape for ${targets.length} URL(s):`);
  for (const u of targets) console.log(`  • ${u}`);

  await prisma.business.upsert({
    where: { id: TEST_BUSINESS_ID },
    update: { config: { competitorUrls: targets } },
    create: {
      id: TEST_BUSINESS_ID,
      name: 'Test Cafe',
      type: 'cafe',
      city: 'Tokyo',
      config: { competitorUrls: targets },
    },
  });
  console.log('Business ready:', TEST_BUSINESS_ID);

  const connection = {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
  };

  const queue = new Queue('competitor-collect', { connection });
  const queueEvents = new QueueEvents('competitor-collect', { connection });
  await queueEvents.waitUntilReady();

  const pipelineId = crypto.randomUUID();
  const jobs = [];
  for (const url of targets) {
    const job = await queue.add('competitor-scrape', {
      businessId: TEST_BUSINESS_ID,
      url,
      pipelineId,
    });
    jobs.push(job);
    console.log(`Enqueued ${job.id} → ${url}`);
  }

  for (const job of jobs) {
    try {
      const result = await job.waitUntilFinished(queueEvents, 120_000);
      console.log(`Job ${job.id} done:`, JSON.stringify(result, null, 2));
    } catch (e) {
      console.error(`Job ${job.id} failed:`, e instanceof Error ? e.message : e);
    }
  }

  const snaps = await prisma.dataSnapshot.findMany({
    where: { businessId: TEST_BUSINESS_ID, source: 'competitors' },
    orderBy: { collectedAt: 'desc' },
    take: targets.length,
  });
  console.log(`\n${snaps.length} competitor snapshot(s) in DB:`);
  for (const snap of snaps) {
    const data = snap.data as { url: string; items?: unknown[]; promos?: unknown[] };
    console.log(
      `  • ${data.url} — ${data.items?.length ?? 0} items, ${data.promos?.length ?? 0} promos (${snap.collectedAt.toISOString()})`
    );
  }

  const runs = await prisma.agentRun.findMany({
    where: { pipelineId, agentName: 'competitor-parser' },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      status: true,
      durationMs: true,
      tokenCount: true,
      error: true,
    },
  });
  console.log(`\n${runs.length} agent run(s) for pipeline ${pipelineId}:`);
  for (const r of runs) {
    console.log(
      `  • ${r.id} [${r.status}] ${r.durationMs ?? '?'}ms, ${r.tokenCount ?? 0} tokens${r.error ? ' — ' + r.error : ''}`
    );
  }

  await queueEvents.close();
  await queue.close();
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
