import { UpdateJobSchema } from '@smartjob/shared';
import { z } from 'zod';

export const UpdateJobDto = UpdateJobSchema;

export type UpdateJobDto = z.infer<typeof UpdateJobDto>;