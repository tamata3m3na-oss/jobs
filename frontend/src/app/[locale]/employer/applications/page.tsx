'use client';

import React, { useState } from 'react';
import { useEmployerApplications } from '@/hooks/useEmployerApplications';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Eye, CheckCircle, XCircle, Filter, Search } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { useToast } from '@/components/ui/Toast';

export default function AllApplicationsPage() {
  const [status, setStatus] = useState<string>('ALL');
  const { applications, isLoading, updateStatus } = useEmployerApplications({
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
      header: 'Applied For',
      accessorKey: 'jobTitle',
      cell: (app: any) => (
        <Link
          href={`/employer/jobs/${app.jobId}/applications`}
          className="hover:underline font-medium"
        >
          {app.jobTitle}
        </Link>
      ),
    },
    {
      header: 'Match Score',
      accessorKey: 'matchScore',
      cell: (app: any) => (
        <div
          className={`text-sm font-bold ${app.matchScore >= 80 ? 'text-green-600' : app.matchScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}
        >
          {app.matchScore}%
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
          <Button variant="ghost" size="icon" asChild title="View Details">
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
            title="Shortlist"
          >
            <CheckCircle className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive"
            onClick={() => handleStatusUpdate(app.id, 'REJECTED')}
            disabled={app.status === 'REJECTED'}
            title="Reject"
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
          <h1 className="text-3xl font-bold tracking-tight">All Applications</h1>
          <p className="text-muted-foreground">Manage candidates across all your job postings.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Candidates</CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Search applicants..."
                  className="pl-8 h-9 w-[200px] md:w-[300px] border rounded-md text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select
                  className="text-sm border rounded h-9 p-1"
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
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={applications}
            isLoading={isLoading}
            emptyMessage="No applications found."
          />
        </CardContent>
      </Card>
    </div>
  );
}
