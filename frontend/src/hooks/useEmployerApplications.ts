'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { PAGINATION } from '@/lib/constants';

export interface EmployerApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhoto?: string;
  status:
    | 'PENDING'
    | 'REVIEWING'
    | 'SHORTLISTED'
    | 'INTERVIEWING'
    | 'OFFERED'
    | 'REJECTED'
    | 'WITHDRAWN';
  matchScore: number;
  appliedAt: string;
  resumeUrl?: string;
  coverLetter?: string;
}

export interface EmployerApplicationsResponse {
  applications: EmployerApplication[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function useEmployerApplications(
  filters: { jobId?: string; status?: string; page?: number } = {}
) {
  const queryClient = useQueryClient();
  const page = filters.page || PAGINATION.DEFAULT_PAGE;

  const queryKey = ['employer-applications', filters];

  const { data, isLoading, isError, error } = useQuery({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', PAGINATION.DEFAULT_LIMIT.toString());
      if (filters.jobId) params.append('jobId', filters.jobId);
      if (filters.status) params.append('status', filters.status);

      return api.get<EmployerApplicationsResponse>(`/employer/applications?${params.toString()}`);
    },
  });

  const updateApplicationStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return api.patch(`/employer/applications/${id}/status`, { status });
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['employer-applications'] });
      queryClient.invalidateQueries({ queryKey: ['employer-application', id] });
    },
  });

  return {
    applications: data?.applications || [],
    total: data?.total || 0,
    page: data?.page || page,
    totalPages: data?.totalPages || 1,
    isLoading,
    isError,
    error,
    updateStatus: updateApplicationStatusMutation.mutateAsync,
    isUpdating: updateApplicationStatusMutation.isPending,
  };
}

export function useEmployerApplication(id: string) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['employer-application', id],
    queryFn: async () => {
      if (!id) return null;
      return api.get<any>(`/employer/applications/${id}`);
    },
    enabled: !!id,
  });

  return {
    application: data,
    isLoading,
    isError,
    error,
  };
}
