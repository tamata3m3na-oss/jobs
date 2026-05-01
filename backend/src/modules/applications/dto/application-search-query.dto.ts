import { ApplicationSearchFiltersSchema, ApplicationStatus } from '@smartjob/shared';
import { z } from 'zod';

export const ApplicationSearchQueryDto = ApplicationSearchFiltersSchema;

export type ApplicationSearchQueryDto = z.infer<typeof ApplicationSearchQueryDto>;

export interface ApplicationListResponse {
  data: import('./application-response.dto').ApplicationResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ApplicationStatsResponse {
  jobId: string;
  totalApplications: number;
  statusBreakdown: Record<string, number>;
  averageMatchScore: number | null;
  newApplications: number;
  pendingReview: number;
  inInterview: number;
}
