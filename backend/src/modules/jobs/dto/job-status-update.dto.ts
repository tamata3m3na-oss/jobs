import { z } from 'zod';

export const JobStatusUpdateDto = z.object({
  status: z.enum(['DRAFT', 'PENDING_APPROVAL', 'ACTIVE', 'PAUSED', 'CLOSED']),
});

export type JobStatusUpdateDto = z.infer<typeof JobStatusUpdateDto>;
