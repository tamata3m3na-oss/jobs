import { z } from 'zod';

export const PaginationQueryDto = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['date', 'matchScore', 'status']).default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type PaginationQueryDto = z.infer<typeof PaginationQueryDto>;
