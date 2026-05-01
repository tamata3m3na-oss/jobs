import { CreateJobSchema, JobLocationSchema, BenefitsSchema } from '@smartjob/shared';
import { z } from 'zod';

export const CreateJobDto = CreateJobSchema;

export type CreateJobDto = z.infer<typeof CreateJobDto>;
