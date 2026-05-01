import { z } from 'zod';

export const PaginationQueryDto = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['createdAt', 'updatedAt', 'title', 'views', 'applicationsCount']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type PaginationQueryDto = z.infer<typeof PaginationQueryDto>;