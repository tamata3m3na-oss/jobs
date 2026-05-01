import { RegisterJobSeekerSchema, RegisterEmployerSchema } from '@smartjob/shared';
import { z } from 'zod';

export const CreateUserSchema = z.union([RegisterJobSeekerSchema, RegisterEmployerSchema]);
export type CreateUserDto = z.infer<typeof CreateUserSchema>;
