import { ZodSchema } from 'zod';
import { ValidationError } from '@/lib/errors';

export async function parseBody<T>(
  request: Request,
  schema: ZodSchema<T>
): Promise<T> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new ValidationError('Invalid JSON body');
  }
  return schema.parse(body);
}
