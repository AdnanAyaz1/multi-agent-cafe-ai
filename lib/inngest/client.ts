import { Inngest } from 'inngest';

export const inngest = new Inngest({
  id: 'agentic-ai',
  name: 'Agentic AI',
  signingKey: process.env.INNGEST_SIGNING_KEY,
  baseUrl: process.env.INNGEST_BASE_URL || undefined,
});
