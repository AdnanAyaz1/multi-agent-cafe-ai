export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('@/lib/workers/weather-worker');
    const { startScheduler } = await import('@/lib/scheduler');
    startScheduler();
    console.log('[boot] workers and scheduler initialized');
  }
}
