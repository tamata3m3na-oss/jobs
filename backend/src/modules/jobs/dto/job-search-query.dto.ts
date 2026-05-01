import { JobSearchFiltersSchema, LocationSchema } from '@smartjob/shared';
import { z } from 'zod';

export const JobSearchQueryDto = JobSearchFiltersSchema;

export type JobSearchQueryDto = z.infer<typeof JobSearchQueryDto>;