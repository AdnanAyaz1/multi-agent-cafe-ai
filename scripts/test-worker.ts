import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Queue, QueueEvents } from 'bullmq';
import 'dotenv/config';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const biz = await prisma.business.upsert({
    where: { id: 'test-biz-1' },
    update: {},
    create: {
      id: 'test-biz-1',
      name: 'Test Cafe',
      type: 'cafe',
      city: 'Tokyo',
    },
  });
  console.log('Business ready:', biz.name);

  const connection = {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
  };

  const queue = new Queue('data-collect', { connection });
  const queueEvents = new QueueEvents('data-collect', { connection });
  await queueEvents.waitUntilReady();

  const job = await queue.add('weather-fetch', {
    businessId: 'test-biz-1',
    city: 'Tokyo',
  });
  console.log('Job enqueued:', job.id);

  await job.waitUntilFinished(queueEvents, 30000);
  console.log('Job finished:', await job.returnvalue);

  const snap = await prisma.dataSnapshot.findFirst({
    where: { businessId: 'test-biz-1', source: 'weather' },
    orderBy: { collectedAt: 'desc' },
  });
  console.log('Snapshot saved:', snap ? 'YES' : 'NO');
  if (snap) console.log('  temperature:', (snap.data as { temperature: number }).temperature);

  await queueEvents.close();
  await queue.close();
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
