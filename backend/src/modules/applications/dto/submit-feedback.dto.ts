import { SubmitInterviewFeedbackSchema } from '@smartjob/shared';
import { z } from 'zod';

export const SubmitFeedbackDto = SubmitInterviewFeedbackSchema;

export type SubmitFeedbackDto = z.infer<typeof SubmitFeedbackDto>;
