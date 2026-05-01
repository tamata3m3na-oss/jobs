'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { API_ENDPOINTS, PAGINATION } from '@/lib/constants';

export interface Job {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  jobType: string;
  experienceLevel: string;
  location: {
    city?: string;
    country?: string;
    isRemote: boolean;
    remoteOptions: string;
  };
  salary?: {
    min: number;
    max: number;
    currency: string;
    period: string;
  };
  skills: string[];
  createdAt: string;
  views: number;
  applicationsCount: number;
  employer: {
    id: string;
    companyName: string;
    logoUrl?: string;
  };
  matchScore?: number;
  isSaved?: boolean;
}

export interface JobFilters {
  keyword?: string;
  location?: string;
  jobType?: string;
  experienceLevel?: string;
  salaryMin?: number;
  salaryMax?: number;
  skills?: string[];
  postedWithin?: string;
}

export interface JobsResponse {
  jobs: Job[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function useJobs(filters: JobFilters = {}, page = PAGINATION.DEFAULT_PAGE) {
  const queryClient = useQueryClient();

  const queryKey = ['jobs', filters, page];

  const { data, isLoading, isError, error } = useQuery({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filters.keyword) params.append('keyword', filters.keyword);
      if (filters.location) params.append('location', filters.location);
      if (filters.jobType) params.append('jobType', filters.jobType);
      if (filters.experienceLevel) params.append('experienceLevel', filters.experienceLevel);
      if (filters.salaryMin) params.append('salaryMin', filters.salaryMin.toString());
      if (filters.salaryMax) params.append('salaryMax', filters.salaryMax.toString());
      if (filters.skills?.length) params.append('skills', filters.skills.join(','));
      if (filters.postedWithin) params.append('postedWithin', filters.postedWithin);
      params.append('page', page.toString());
      params.append('limit', PAGINATION.DEFAULT_LIMIT.toString());

      const response = await api.get<JobsResponse>(
        `${API_ENDPOINTS.JOBS.SEARCH}?${params.toString()}`
      );
      return response;
    },
    staleTime: 1000 * 60 * 5,
  });

  const saveJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      return api.post(`/jobs/${jobId}/save`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['savedJobs'] });
    },
  });

  const unsaveJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      return api.delete(`/jobs/${jobId}/save`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['savedJobs'] });
    },
  });

  const saveJob = async (jobId: string) => {
    try {
      await saveJobMutation.mutateAsync(jobId);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const unsaveJob = async (jobId: string) => {
    try {
      await unsaveJobMutation.mutateAsync(jobId);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  return {
    jobs: data?.jobs || [],
    total: data?.total || 0,
    page: data?.page || page,
    totalPages: data?.totalPages || 1,
    isLoading,
    isError,
    error,
    saveJob,
    unsaveJob,
    isSaving: saveJobMutation.isPending || unsaveJobMutation.isPending,
  };
}

export function useSavedJobs() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['savedJobs'],
    queryFn: async () => {
      const response = await api.get<{ jobs: Job[] }>('/jobs/saved');
      return response.jobs || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  return {
    savedJobs: data || [],
    isLoading,
    isError,
  };
}

export function useFeaturedJobs() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['featuredJobs'],
    queryFn: async () => {
      const response = await api.get<{ jobs: Job[] }>(API_ENDPOINTS.JOBS.FEATURED);
      return response.jobs || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  return {
    jobs: data || [],
    isLoading,
    isError,
  };
}

export function useJobRecommendations() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['jobRecommendations'],
    queryFn: async () => {
      const response = await api.get<{ jobs: Job[] }>(API_ENDPOINTS.JOBS.RECOMMENDATIONS);
      return response.jobs || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  return {
    jobs: data || [],
    isLoading,
    isError,
  };
}
