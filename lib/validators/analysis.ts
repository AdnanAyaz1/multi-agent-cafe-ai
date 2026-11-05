import { z } from 'zod';

export const pipelineTypeEnum = z.enum(['weather', 'competitor']);
export type PipelineType = z.infer<typeof pipelineTypeEnum>;

export const analysisRunRequestSchema = z.object({
  businessId: z
    .string({ message: 'businessId is required' })
    .min(1, 'businessId cannot be empty')
    .max(64, 'businessId is too long'),
  pipelineType: pipelineTypeEnum.default('weather'),
  city: z
    .string()
    .trim()
    .min(1, 'City cannot be empty')
    .max(100, 'City is too long')
    .optional(),
  competitorUrl: z
    .string()
    .trim()
    .min(1, 'Competitor URL cannot be empty')
    .max(500, 'Competitor URL is too long')
    .optional(),
});

export type AnalysisRunRequest = z.infer<typeof analysisRunRequestSchema>;

export const analysisFormSchema = z.object({
  businessId: z
    .string()
    .min(1, 'Enter a business ID')
    .max(64, 'Business ID is too long'),
  city: z.string().trim().max(100).optional(),
  competitorUrl: z.string().trim().max(500).optional(),
});

export type AnalysisFormInput = z.infer<typeof analysisFormSchema>;

export const pipelineIdSchema = z
  .string({ message: 'pipelineId is required' })
  .uuid('pipelineId must be a UUID');
