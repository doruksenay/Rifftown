import { z } from 'zod';
import { GameError } from '../errors';

export function parse<T extends z.ZodType>(schema: T, data: unknown): z.infer<T> {
  const r = schema.safeParse(data ?? {});
  if (!r.success) {
    throw new GameError('invalid_input', 400, r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '));
  }
  return r.data;
}

export const idParam = z.object({ id: z.coerce.number().int().positive() });
