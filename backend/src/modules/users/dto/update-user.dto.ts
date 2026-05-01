import { BaseUserSchema } from '@smartjob/shared';
import { z } from 'zod';

export const UpdateUserSchema = BaseUserSchema.pick({
  firstName: true,
  lastName: true,
  phone: true,
  avatarUrl: true,
}).partial();

export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
