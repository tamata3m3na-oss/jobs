import { UpdateApplicationStatusSchema } from '@smartjob/shared';
import { z } from 'zod';

export const UpdateApplicationStatusDto = UpdateApplicationStatusSchema;

export type UpdateApplicationStatusDto = z.infer<typeof UpdateApplicationStatusDto>;
