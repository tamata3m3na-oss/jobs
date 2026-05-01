import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { User } from '@smartjob/shared';

export function useAdminUsers() {
  const queryClient = useQueryClient();

  const usersQuery = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/users');
      return res.data.data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiClient.patch(`/admin/users/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/admin/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });

  return {
    users: usersQuery.data,
    isLoading: usersQuery.isLoading,
    error: usersQuery.error,
    updateStatus: updateStatusMutation.mutate,
    isUpdating: updateStatusMutation.isPending,
    deleteUser: deleteUserMutation.mutate,
    isDeleting: deleteUserMutation.isPending,
  };
}

export function useAdminUser(id: string) {
  const queryClient = useQueryClient();

  const userQuery = useQuery({
    queryKey: ['admin', 'users', id],
    queryFn: async () => {
      const res = await apiClient.get(`/admin/users/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });

  return {
    user: userQuery.data,
    isLoading: userQuery.isLoading,
    error: userQuery.error,
  };
}

export function useAdminJobs() {
  const queryClient = useQueryClient();

  const jobsQuery = useQuery({
    queryKey: ['admin', 'jobs'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/jobs');
      return res.data.data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, reason }: { id: string; status: string; reason?: string }) => {
      await apiClient.patch(`/admin/jobs/${id}/status`, { status, reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'jobs'] });
    },
  });

  return {
    jobs: jobsQuery.data,
    isLoading: jobsQuery.isLoading,
    error: jobsQuery.error,
    updateStatus: updateStatusMutation.mutate,
    isUpdating: updateStatusMutation.isPending,
  };
}

export function useAdminJob(id: string) {
  const jobQuery = useQuery({
    queryKey: ['admin', 'jobs', id],
    queryFn: async () => {
      const res = await apiClient.get(`/admin/jobs/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });

  return {
    job: jobQuery.data,
    isLoading: jobQuery.isLoading,
    error: jobQuery.error,
  };
}

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const res = await apiClient.get('/analytics/admin');
      return res.data;
    },
  });
}
