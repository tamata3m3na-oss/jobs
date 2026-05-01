import { z } from 'zod';

export const AddEmployerNoteDto = z.object({
  content: z.string().min(1).max(1000),
});

export type AddEmployerNoteDto = z.infer<typeof AddEmployerNoteDto>;
