import { Inngest } from 'inngest';

export const inngest = new Inngest({
  id: 'agentic-ai',
  name: 'Agentic AI',
  baseUrl: process.env.INNGEST_BASE_URL || undefined,
});
