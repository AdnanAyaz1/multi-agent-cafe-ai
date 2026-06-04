import { z } from 'zod';

export const analysisRunRequestSchema = z.object({
  businessId: z
    .string({ message: 'businessId is required' })
    .min(1, 'businessId cannot be empty')
    .max(64, 'businessId is too long'),
});

export type AnalysisRunRequest = z.infer<typeof analysisRunRequestSchema>;

export const pipelineIdSchema = z
  .string({ message: 'pipelineId is required' })
  .uuid('pipelineId must be a UUID');
