import { z } from 'zod';

export const competitorRefreshRequestSchema = z
  .object({
    businessId: z.string().min(1, 'businessId is required').max(120),
    /**
     * Optional URL override. When omitted, the worker uses every URL stored
     * in Business.config.competitorUrls.
     */
    url: z.string().url('url must be a valid http(s) URL').optional(),
    timeoutMs: z.number().int().min(5000).max(120_000).optional(),
    maxTextLength: z.number().int().min(1000).max(200_000).optional(),
  })
  .strict();

export type CompetitorRefreshRequest = z.infer<
  typeof competitorRefreshRequestSchema
>;

export const competitorSnapshotQuerySchema = z
  .object({
    businessId: z.string().min(1).max(120),
    limit: z.coerce.number().int().min(1).max(50).optional(),
  })
  .strict();

export type CompetitorSnapshotQuery = z.infer<
  typeof competitorSnapshotQuerySchema
>;
