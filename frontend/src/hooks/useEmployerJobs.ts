'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { PAGINATION } from '@/lib/constants';

export interface EmployerJob {
  id: string;
  title: string;
  status: 'ACTIVE' | 'PAUSED' | 'CLOSED' | 'DRAFT';
  applicationsCount: number;
  createdAt: string;
  updatedAt: string;
  location: {
    city?: string;
    country?: string;
    isRemote: boolean;
  };
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
}

export interface EmployerJobsResponse {
  jobs: EmployerJob[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function useEmployerJobs(page = PAGINATION.DEFAULT_PAGE, status?: string) {
  const queryClient = useQueryClient();

  const queryKey = ['employer-jobs', page, status];

  const { data, isLoading, isError, error } = useQuery({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', PAGINATION.DEFAULT_LIMIT.toString());
      if (status) params.append('status', status);

      return api.get<EmployerJobsResponse>(`/employer/jobs?${params.toString()}`);
    },
  });

  const createJobMutation = useMutation({
    mutationFn: async (jobData: any) => {
      return api.post('/employer/jobs', jobData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employer-jobs'] });
    },
  });

  const updateJobMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return api.patch(`/employer/jobs/${id}`, data);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['employer-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['employer-job', id] });
    },
  });

  const deleteJobMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/employer/jobs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employer-jobs'] });
    },
  });

  const duplicateJobMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.post(`/employer/jobs/${id}/duplicate`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employer-jobs'] });
    },
  });

  return {
    jobs: data?.jobs || [],
    total: data?.total || 0,
    page: data?.page || page,
    totalPages: data?.totalPages || 1,
    isLoading,
    isError,
    error,
    createJob: createJobMutation.mutateAsync,
    updateJob: updateJobMutation.mutateAsync,
    deleteJob: deleteJobMutation.mutateAsync,
    duplicateJob: duplicateJobMutation.mutateAsync,
    isCreating: createJobMutation.isPending,
    isUpdating: updateJobMutation.isPending,
    isDeleting: deleteJobMutation.isPending,
    isDuplicating: duplicateJobMutation.isPending,
  };
}

export function useEmployerJob(id: string) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['employer-job', id],
    queryFn: async () => {
      if (!id || id === 'new') return null;
      return api.get<any>(`/employer/jobs/${id}`);
    },
    enabled: !!id && id !== 'new',
  });

  return {
    job: data,
    isLoading,
    isError,
    error,
  };
}
