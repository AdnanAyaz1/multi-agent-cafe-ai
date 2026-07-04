import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function clearAllData() {
  console.log('Clearing all data from database...');

  // Delete in order of dependencies
  await prisma.decision.deleteMany();
  console.log('  Cleared decisions');

  await prisma.recommendationAction.deleteMany();
  console.log('  Cleared recommendation actions');

  await prisma.recommendation.deleteMany();
  console.log('  Cleared recommendations');

  await prisma.agentRun.deleteMany();
  console.log('  Cleared agent runs');

  await prisma.dataSnapshot.deleteMany();
  console.log('  Cleared data snapshots');

  await prisma.alert.deleteMany();
  console.log('  Cleared alerts');

  await prisma.business.deleteMany();
  console.log('  Cleared businesses');

  await prisma.subscription.deleteMany();
  console.log('  Cleared subscriptions');

  await prisma.session.deleteMany();
  console.log('  Cleared sessions');

  await prisma.account.deleteMany();
  console.log('  Cleared accounts');

  await prisma.user.deleteMany();
  console.log('  Cleared users');

  await prisma.jobSchedule.deleteMany();
  console.log('  Cleared job schedules');

  await prisma.verificationToken.deleteMany();
  console.log('  Cleared verification tokens');

  console.log('All data cleared successfully!');
}

clearAllData()
  .catch((e) => {
    console.error('Failed to clear data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
