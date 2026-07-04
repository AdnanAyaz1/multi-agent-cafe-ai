import { logger } from '@/lib/logger';

const log = logger.child('boot');

export async function register(): Promise<void> {
  // Workers are now handled by Inngest functions (lib/inngest/functions.ts).
  // On Vercel, Inngest triggers via the /api/inngest endpoint.
  // No persistent worker processes needed.
  log.info('application initialized — Inngest handles background jobs');
}
