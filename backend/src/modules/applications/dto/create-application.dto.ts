import { CreateApplicationSchema } from '@smartjob/shared';
import { z } from 'zod';

export const CreateApplicationDto = CreateApplicationSchema;

export type CreateApplicationDto = z.infer<typeof CreateApplicationDto>;
