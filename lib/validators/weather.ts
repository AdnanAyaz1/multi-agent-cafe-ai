import { z } from 'zod';

export const weatherRequestSchema = z.object({
  city: z
    .string({ message: 'City is required' })
    .min(1, 'City cannot be empty')
    .max(100, 'City name is too long')
    .trim(),
});

export type WeatherRequest = z.infer<typeof weatherRequestSchema>;
