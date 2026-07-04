import { serve } from 'inngest/next';
import { inngest } from '@/lib/inngest/client';
import {
  runAnalysisPipeline,
  runCompetitorScrape,
  runWeatherFetch,
  weatherFetchCron,
  competitorScrapeCron,
  dailyAnalysisCron,
} from '@/lib/inngest/functions';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    runAnalysisPipeline,
    runCompetitorScrape,
    runWeatherFetch,
    weatherFetchCron,
    competitorScrapeCron,
    dailyAnalysisCron,
  ],
});
