import { ScheduleInterviewSchema } from '@smartjob/shared';
import { z } from 'zod';

export const ScheduleInterviewDto = ScheduleInterviewSchema;

export type ScheduleInterviewDto = z.infer<typeof ScheduleInterviewDto>;
