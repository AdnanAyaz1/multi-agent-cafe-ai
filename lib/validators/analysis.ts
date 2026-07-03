import { z } from 'zod';

export const pipelineTypeEnum = z.enum(['weather', 'competitor']);
export type PipelineType = z.infer<typeof pipelineTypeEnum>;

export const analysisRunRequestSchema = z.object({
  businessId: z
    .string({ message: 'businessId is required' })
    .min(1, 'businessId cannot be empty')
    .max(64, 'businessId is too long'),
  pipelineType: pipelineTypeEnum.default('weather'),
});

export type AnalysisRunRequest = z.infer<typeof analysisRunRequestSchema>;

export const analysisFormSchema = z.object({
  businessId: z
    .string()
    .min(1, 'Enter a business ID')
    .max(64, 'Business ID is too long'),
});

export type AnalysisFormInput = z.infer<typeof analysisFormSchema>;

export const pipelineIdSchema = z
  .string({ message: 'pipelineId is required' })
  .uuid('pipelineId must be a UUID');
