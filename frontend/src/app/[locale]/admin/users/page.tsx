'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
import { User } from '@smartjob/shared';

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const { data: response, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/users');
      return res.data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiClient.patch(`/admin/users/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  if (isLoading) return <div className="p-8 text-center">Loading users...</div>;

  const columns = [
    {
      header: 'Name',
      accessorKey: 'firstName' as keyof User,
      cell: (user: User) => `${user.firstName} ${user.lastName}`,
    },
    { header: 'Email', accessorKey: 'email' as keyof User },
    {
      header: 'Role',
      accessorKey: 'role' as keyof User,
      cell: (user: User) => <Badge variant="secondary">{user.role}</Badge>,
    },
    {
      header: 'Status',
      accessorKey: 'status' as keyof User,
      cell: (user: User) => (
        <Badge variant={user.status === 'ACTIVE' ? 'success' : 'destructive'}>{user.status}</Badge>
      ),
    },
    {
      header: 'Joined',
      accessorKey: 'createdAt' as keyof User,
      cell: (user: User) => formatDate(user.createdAt),
    },
    {
      header: 'Actions',
      accessorKey: 'id' as keyof User,
      cell: (user: User) => (
        <div className="flex gap-2">
          {user.status !== 'ACTIVE' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateStatusMutation.mutate({ id: user.id, status: 'ACTIVE' })}
            >
              Activate
            </Button>
          )}
          {user.status === 'ACTIVE' && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => updateStatusMutation.mutate({ id: user.id, status: 'SUSPENDED' })}
            >
              Suspend
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">Manage system users and their permissions.</p>
      </div>

      <DataTable
        data={response?.data || []}
        columns={columns}
        filterKey="email"
        filterPlaceholder="Search by email..."
      />
    </div>
  );
}
