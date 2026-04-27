'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';

export default function AdminJobsPage() {
  const queryClient = useQueryClient();
  const { data: response, isLoading } = useQuery({
    queryKey: ['admin-jobs'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/jobs');
      return res.data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiClient.patch(`/admin/jobs/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
    },
  });

  if (isLoading) return <div className="p-8 text-center">Loading jobs...</div>;

  const columns = [
    { header: 'Title', accessorKey: 'title' },
    { header: 'Employer ID', accessorKey: 'employerId' },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (job: any) => (
        <Badge
          variant={
            job.status === 'ACTIVE'
              ? 'success'
              : job.status === 'PENDING_APPROVAL'
                ? 'secondary'
                : 'destructive'
          }
        >
          {job.status}
        </Badge>
      ),
    },
    { header: 'Posted', accessorKey: 'createdAt', cell: (job: any) => formatDate(job.createdAt) },
    {
      header: 'Actions',
      accessorKey: 'id',
      cell: (job: any) => (
        <div className="flex gap-2">
          {job.status === 'PENDING_APPROVAL' && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="text-green-600 border-green-600 hover:bg-green-50"
                onClick={() => updateStatusMutation.mutate({ id: job.id, status: 'ACTIVE' })}
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => updateStatusMutation.mutate({ id: job.id, status: 'REJECTED' })}
              >
                Reject
              </Button>
            </>
          )}
          {job.status === 'ACTIVE' && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => updateStatusMutation.mutate({ id: job.id, status: 'CLOSED' })}
            >
              Close
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Job Moderation</h1>
        <p className="text-muted-foreground">Approve or reject job postings from employers.</p>
      </div>

      <DataTable
        data={response?.data || []}
        columns={columns}
        filterKey="title"
        filterPlaceholder="Search by title..."
      />
    </div>
  );
}
