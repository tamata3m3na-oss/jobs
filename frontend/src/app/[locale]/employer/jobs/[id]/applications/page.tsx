'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useEmployerApplications } from '@/hooks/useEmployerApplications';
import { useEmployerJob } from '@/hooks/useEmployerJobs';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Eye, CheckCircle, XCircle, Mail, Download, Filter } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { useToast } from '@/components/ui/Toast';

export default function JobApplicationsPage() {
  const { id } = useParams();
  const [status, setStatus] = useState<string>('ALL');
  const { job } = useEmployerJob(id as string);
  const { applications, isLoading, updateStatus } = useEmployerApplications({
    jobId: id as string,
    status: status === 'ALL' ? undefined : status,
  });
  const { addToast } = useToast();

  const handleStatusUpdate = async (appId: string, newStatus: string) => {
    try {
      await updateStatus({ id: appId, status: newStatus });
      addToast({
        title: 'Status Updated',
        description: `Candidate status changed to ${newStatus.toLowerCase()}.`,
        variant: 'success',
      });
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to update candidate status.',
        variant: 'error',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary">Pending</Badge>;
      case 'REVIEWING':
        return <Badge variant="warning">Reviewing</Badge>;
      case 'SHORTLISTED':
        return <Badge variant="success">Shortlisted</Badge>;
      case 'INTERVIEWING':
        return <Badge variant="info">Interviewing</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const columns = [
    {
      header: 'Applicant',
      accessorKey: 'candidateName',
      cell: (app: any) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={app.candidatePhoto} />
            <AvatarFallback>{app.candidateName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{app.candidateName}</span>
            <span className="text-xs text-muted-foreground">{app.candidateEmail}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Match Score',
      accessorKey: 'matchScore',
      cell: (app: any) => (
        <div className="flex items-center gap-2">
          <div
            className={`text-sm font-bold ${app.matchScore >= 80 ? 'text-green-600' : app.matchScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}
          >
            {app.matchScore}%
          </div>
          <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${app.matchScore >= 80 ? 'bg-green-600' : app.matchScore >= 60 ? 'bg-yellow-600' : 'bg-red-600'}`}
              style={{ width: `${app.matchScore}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (app: any) => getStatusBadge(app.status),
    },
    {
      header: 'Applied Date',
      accessorKey: 'appliedAt',
      cell: (app: any) => new Date(app.appliedAt).toLocaleDateString(),
    },
    {
      id: 'actions',
      cell: (app: any) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/employer/applications/${app.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-green-600"
            onClick={() => handleStatusUpdate(app.id, 'SHORTLISTED')}
            disabled={app.status === 'SHORTLISTED'}
          >
            <CheckCircle className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive"
            onClick={() => handleStatusUpdate(app.id, 'REJECTED')}
            disabled={app.status === 'REJECTED'}
          >
            <XCircle className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
          <p className="text-muted-foreground">
            {job ? `Reviewing candidates for "${job.title}"` : 'Loading job details...'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Candidates</CardTitle>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                className="text-sm border rounded p-1"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="REVIEWING">Reviewing</option>
                <option value="SHORTLISTED">Shortlisted</option>
                <option value="INTERVIEWING">Interviewing</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={applications}
            isLoading={isLoading}
            emptyMessage="No applications found for this job."
          />
        </CardContent>
      </Card>
    </div>
  );
}
