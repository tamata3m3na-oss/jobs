'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';

export interface JobDetail {
  id: string;
  slug: string;
  title: string;
  description: string;
  shortDescription: string;
  requirements: string[];
  responsibilities: string[];
  niceToHave: string[];
  skills: string[];
  jobType: string;
  experienceLevel: string;
  location: {
    address?: string;
    city?: string;
    country?: string;
    coordinates?: [number, number];
    isRemote: boolean;
    remoteOptions: string;
    travelRequirements?: string;
  };
  salary?: {
    min: number;
    max: number;
    currency: string;
    period: string;
    negotiable: boolean;
    competitive: boolean;
  };
  benefits: {
    healthInsurance: boolean;
    dentalInsurance: boolean;
    visionInsurance: boolean;
    retirementPlan: boolean;
    stockOptions: boolean;
    paidTimeOff: boolean;
    parentalLeave: boolean;
    tuitionReimbursement: boolean;
    professionalDevelopment: boolean;
    remoteWork: boolean;
    flexibleHours: boolean;
    lifeInsurance: boolean;
    other: string[];
  };
  applicationQuestions: {
    id: string;
    question: string;
    type: string;
    required: boolean;
    options?: string[];
  }[];
  applicationDeadline?: string;
  startDate?: string;
  openings: number;
  status: string;
  featured: boolean;
  views: number;
  applicationsCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  employer: {
    id: string;
    companyName: string;
    companySize: string;
    companyType: string;
    industry: string;
    logoUrl?: string;
    description: string;
    website?: string;
    linkedInUrl?: string;
    twitterUrl?: string;
    verified: boolean;
    headquarters: {
      city?: string;
      country?: string;
    };
  };
  matchScore?: number;
  isSaved?: boolean;
  hasApplied?: boolean;
}

export interface RelatedJob {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  jobType: string;
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
  employer: {
    companyName: string;
    logoUrl?: string;
  };
  createdAt: string;
}

export function useJob(slug: string) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['job', slug],
    queryFn: async () => {
      const response = await api.get<JobDetail>(`${API_ENDPOINTS.JOBS.BASE}/${slug}`);
      return response;
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
  });

  return {
    job: data,
    isLoading,
    isError,
    error,
  };
}

export function useRelatedJobs(jobId: string) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['relatedJobs', jobId],
    queryFn: async () => {
      const response = await api.get<{ jobs: RelatedJob[] }>(
        `${API_ENDPOINTS.JOBS.BASE}/${jobId}/related`
      );
      return response.jobs || [];
    },
    enabled: !!jobId,
    staleTime: 1000 * 60 * 5,
  });

  return {
    jobs: data || [],
    isLoading,
    isError,
  };
}

export function useToggleSaveJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      jobId,
      slug,
      isSaved,
    }: {
      jobId: string;
      slug: string;
      isSaved: boolean;
    }) => {
      if (isSaved) {
        return api.delete(`/jobs/${jobId}/save`);
      } else {
        return api.post(`/jobs/${jobId}/save`);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['job', variables.slug] });
      queryClient.invalidateQueries({ queryKey: ['savedJobs'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}

export function useShareJob() {
  return useMutation({
    mutationFn: async ({ jobId, platform }: { jobId: string; platform: string }) => {
      return api.post(`/jobs/${jobId}/share`, { platform });
    },
  });
}

export function useMatchScore(jobId: string) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['matchScore', jobId],
    queryFn: async () => {
      const response = await api.get<{ score: number; details: object }>(
        `${API_ENDPOINTS.AI.MATCH}?jobId=${jobId}`
      );
      return response;
    },
    enabled: !!jobId,
    staleTime: 1000 * 60 * 30,
  });

  return {
    score: data?.score,
    details: data?.details,
    isLoading,
    isError,
  };
}
