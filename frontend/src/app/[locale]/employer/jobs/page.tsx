'use client';

import React, { useState } from 'react';
import { useEmployerJobs } from '@/hooks/useEmployerJobs';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { PlusCircle, MoreVertical, Eye, Edit, Pause, Play, Trash, Copy, Users } from 'lucide-react';
import Link from 'next/link';
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/DropdownMenu';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs';

export default function EmployerJobsPage() {
  const [status, setStatus] = useState<string>('ALL');
  const { jobs, isLoading, updateJob, deleteJob, duplicateJob } = useEmployerJobs(
    1,
    status === 'ALL' ? undefined : status
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="success">Active</Badge>;
      case 'PAUSED':
        return <Badge variant="warning">Paused</Badge>;
      case 'CLOSED':
        return <Badge variant="secondary">Closed</Badge>;
      case 'DRAFT':
        return <Badge variant="outline">Draft</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const columns = [
    {
      header: 'Job Title',
      accessorKey: 'title',
      cell: (job: any) => (
        <div className="flex flex-col">
          <span className="font-medium">{job.title}</span>
          <span className="text-xs text-muted-foreground">
            {job.location.isRemote
              ? 'Remote'
              : `${job.location.city || ''}, ${job.location.country || ''}`}
          </span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (job: any) => getStatusBadge(job.status),
    },
    {
      header: 'Applications',
      accessorKey: 'applicationsCount',
      cell: (job: any) => (
        <Link
          href={`/employer/jobs/${job.id}/applications`}
          className="flex items-center gap-1 text-primary hover:underline"
        >
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {job.applicationsCount}
          </span>
        </Link>
      ),
    },
    {
      header: 'Posted Date',
      accessorKey: 'createdAt',
      cell: (job: any) => new Date(job.createdAt).toLocaleDateString(),
    },
    {
      id: 'actions',
      cell: (job: any) => (
        <DropdownMenu
          trigger={
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          }
          align="right"
        >
          <DropdownMenuItem onClick={() => window.open(`/jobs/${job.id}`, '_blank')}>
            <Eye className="mr-2 h-4 w-4" /> View Public
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => (window.location.href = `/employer/jobs/${job.id}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => duplicateJob(job.id)}>
            <Copy className="mr-2 h-4 w-4" /> Duplicate
          </DropdownMenuItem>
          {job.status === 'ACTIVE' ? (
            <DropdownMenuItem onClick={() => updateJob({ id: job.id, data: { status: 'PAUSED' } })}>
              <Pause className="mr-2 h-4 w-4" /> Pause
            </DropdownMenuItem>
          ) : job.status === 'PAUSED' ? (
            <DropdownMenuItem onClick={() => updateJob({ id: job.id, data: { status: 'ACTIVE' } })}>
              <Play className="mr-2 h-4 w-4" /> Resume
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem
            variant="destructive"
            onClick={() => {
              if (confirm('Are you sure you want to delete this job?')) {
                deleteJob(job.id);
              }
            }}
          >
            <Trash className="mr-2 h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Jobs Management</h1>
          <p className="text-muted-foreground">Create and manage your job postings.</p>
        </div>
        <Button asChild>
          <Link href="/employer/jobs/new">
            <span className="flex items-center">
              <PlusCircle className="mr-2 h-4 w-4" />
              Post New Job
            </span>
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Tabs defaultValue="ALL" value={status} onValueChange={setStatus} className="w-full">
              <TabsList>
                <TabsTrigger value="ALL">All Jobs</TabsTrigger>
                <TabsTrigger value="ACTIVE">Active</TabsTrigger>
                <TabsTrigger value="PAUSED">Paused</TabsTrigger>
                <TabsTrigger value="CLOSED">Closed</TabsTrigger>
                <TabsTrigger value="DRAFT">Drafts</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={jobs}
            isLoading={isLoading}
            emptyMessage="No jobs found."
          />
        </CardContent>
      </Card>
    </div>
  );
}
