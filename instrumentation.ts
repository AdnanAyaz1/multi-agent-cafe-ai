import { logger } from '@/lib/logger';

const log = logger.child('boot');

export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === 'nodejs' && !process.env.VERCEL) {
    await import('@/lib/workers/weather-worker');
    await import('@/lib/workers/analysis-worker');
    await import('@/lib/workers/competitor-worker');
    const { startScheduler } = await import('@/lib/scheduler');
    startScheduler();
    log.info('workers and scheduler initialized');
  }
}
