'use client';

import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '@/contexts/AuthContext';
import { useAuthStore, AppUser } from '@/stores/useAuthStore';
import { api } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';

// Hook to access auth context
export function useAuth() {
  const context = useAuthContext();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  return {
    ...context,
    isAuthenticated,
    user,
    token,
  };
}

// Hook for login mutation
export function useLogin() {
  const { login } = useAuthContext();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      login(email, password),
    onSuccess: () => {
      // Optionally invalidate queries on successful login
    },
  });
}

// Hook for logout mutation
export function useLogout() {
  const { logout } = useAuthContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        await api.post(API_ENDPOINTS.AUTH.LOGOUT);
      } catch {
        // Continue with logout even if API call fails
      }
      logout();
    },
    onSuccess: () => {
      // Clear all queries on logout
      queryClient.clear();
    },
  });
}

// Hook for registration mutation
export function useRegister() {
  const { register } = useAuthContext();

  return useMutation({
    mutationFn: (data: RegisterData) => register(data),
  });
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'JOB_SEEKER' | 'EMPLOYER';
  phone?: string;
  companyName?: string;
  companySize?: string;
  companyType?: string;
  industry?: string;
}

// Hook for getting current user profile
export function useCurrentUser() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await api.get<{ data: AppUser }>(API_ENDPOINTS.AUTH.ME);
      return response?.data as AppUser;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Hook for token refresh
export function useRefreshToken() {
  const { refreshToken: refreshTokenFn } = useAuthContext();

  const refresh = useCallback(async () => {
    return refreshTokenFn();
  }, [refreshTokenFn]);

  return {
    refresh,
    isRefreshing: useAuthStore((state) => state.isLoading),
  };
}

// Hook for updating user profile
export function useUpdateProfile() {
  const { updateUser } = useAuthContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<AppUser>) => {
      const response = await api.patch<{ data: AppUser }>(API_ENDPOINTS.USERS.PROFILE, data);
      return response?.data as AppUser;
    },
    onSuccess: (data) => {
      updateUser(data);
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });
}
