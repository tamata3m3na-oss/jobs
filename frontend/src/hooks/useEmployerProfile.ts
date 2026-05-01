'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

export interface EmployerProfile {
  id: string;
  companyName: string;
  logoUrl?: string;
  description?: string;
  website?: string;
  industry?: string;
  companySize?: string;
  location?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
  culture?: string;
  benefits?: string[];
  isVerified: boolean;
}

export function useEmployerProfile() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['employer-profile'],
    queryFn: async () => {
      return api.get<EmployerProfile>('/employer/profile');
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: Partial<EmployerProfile>) => {
      return api.patch('/employer/profile', profileData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employer-profile'] });
    },
  });

  return {
    profile: data,
    isLoading,
    isError,
    error,
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdating: updateProfileMutation.isPending,
  };
}
