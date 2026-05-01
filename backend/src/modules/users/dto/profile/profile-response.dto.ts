import { JobSeekerProfile, EmployerProfile } from '@smartjob/shared';

export type ProfileResponseDto = JobSeekerProfile | EmployerProfile | Record<string, unknown>;
