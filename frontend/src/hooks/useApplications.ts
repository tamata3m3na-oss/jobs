'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';

export type ApplicationStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'SHORTLISTED'
  | 'INTERVIEW_SCHEDULED'
  | 'INTERVIEW_COMPLETED'
  | 'OFFER_EXTENDED'
  | 'OFFER_ACCEPTED'
  | 'OFFER_DECLINED'
  | 'REJECTED'
  | 'WITHDRAWN';

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  jobSlug: string;
  employerId: string;
  employerName: string;
  employerLogo?: string;
  status: ApplicationStatus;
  appliedAt: string;
  updatedAt: string;
  statusHistory: {
    status: ApplicationStatus;
    timestamp: string;
    notes?: string;
  }[];
  matchScore?: number;
  resumeUrl?: string;
  coverLetterUrl?: string;
  answers?: {
    questionId: string;
    question: string;
    answer: string;
  }[];
  notes?: string;
  employerNotes?: string;
}

export interface ApplicationsResponse {
  applications: Application[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApplicationDetail extends Application {
  job: {
    id: string;
    title: string;
    slug: string;
    companyName: string;
    companyLogo?: string;
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
    jobType: string;
  };
  timeline: {
    id: string;
    status: ApplicationStatus;
    timestamp: string;
    title: string;
    description?: string;
    notes?: string;
  }[];
}

export function useApplications(filters: { status?: ApplicationStatus } = {}, page = 1) {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['applications', filters, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      params.append('page', page.toString());

      const response = await api.get<ApplicationsResponse>(
        `${API_ENDPOINTS.APPLICATIONS.MY}?${params.toString()}`
      );
      return response;
    },
    staleTime: 1000 * 60 * 2,
  });

  return {
    applications: data?.applications || [],
    total: data?.total || 0,
    page: data?.page || page,
    totalPages: data?.totalPages || 1,
    isLoading,
    isError,
    error,
  };
}

export function useApplication(id: string) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['application', id],
    queryFn: async () => {
      const response = await api.get<ApplicationDetail>(`${API_ENDPOINTS.APPLICATIONS.BASE}/${id}`);
      return response;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });

  return {
    application: data,
    isLoading,
    isError,
    error,
  };
}

export function useWithdrawApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (applicationId: string) => {
      return api.patch(`${API_ENDPOINTS.APPLICATIONS.BASE}/${applicationId}/withdraw`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });
}

export function useApplicationStats() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['applicationStats'],
    queryFn: async () => {
      const response = await api.get<{
        total: number;
        byStatus: { status: ApplicationStatus; count: number }[];
        responseRate: number;
        avgTimeToResponse: number;
      }>('/applications/stats');
      return response;
    },
    staleTime: 1000 * 60 * 5,
  });

  return {
    stats: data,
    isLoading,
    isError,
  };
}

export function getStatusLabel(status: ApplicationStatus): string {
  const labels: Record<ApplicationStatus, string> = {
    SUBMITTED: 'Submitted',
    UNDER_REVIEW: 'Under Review',
    SHORTLISTED: 'Shortlisted',
    INTERVIEW_SCHEDULED: 'Interview Scheduled',
    INTERVIEW_COMPLETED: 'Interview Completed',
    OFFER_EXTENDED: 'Offer Extended',
    OFFER_ACCEPTED: 'Offer Accepted',
    OFFER_DECLINED: 'Offer Declined',
    REJECTED: 'Rejected',
    WITHDRAWN: 'Withdrawn',
  };
  return labels[status] || status;
}

export function getStatusVariant(
  status: ApplicationStatus
): 'success' | 'warning' | 'destructive' | 'info' | 'default' {
  const variants: Record<
    ApplicationStatus,
    'success' | 'warning' | 'destructive' | 'info' | 'default'
  > = {
    SUBMITTED: 'info',
    UNDER_REVIEW: 'info',
    SHORTLISTED: 'success',
    INTERVIEW_SCHEDULED: 'success',
    INTERVIEW_COMPLETED: 'success',
    OFFER_EXTENDED: 'success',
    OFFER_ACCEPTED: 'success',
    OFFER_DECLINED: 'warning',
    REJECTED: 'destructive',
    WITHDRAWN: 'default',
  };
  return variants[status] || 'default';
}
