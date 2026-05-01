'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAdminJobs } from '@/hooks/useAdmin';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
import { Eye, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Input } from '@/components/ui/Input';

export default function AdminJobsPage() {
  const t = useTranslations('admin.jobs');
  const common = useTranslations('Common');
  const { locale } = useParams();
  const { jobs, isLoading, updateStatus } = useAdminJobs();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredJobs = jobs?.filter((job: any) =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      header: 'Job Title',
      accessorKey: 'title',
      cell: (job: any) => (
        <div className="flex flex-col">
          <span className="font-medium">{job.title}</span>
          <span className="text-xs text-muted-foreground">
            {job.companyName || 'Unknown Company'}
          </span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (job: any) => (
        <Badge
          variant={
            job.status === 'ACTIVE'
              ? 'success'
              : job.status === 'PENDING_APPROVAL'
                ? 'warning'
                : job.status === 'REJECTED'
                  ? 'destructive'
                  : 'outline'
          }
        >
          {job.status.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      header: 'Posted Date',
      accessorKey: 'createdAt',
      cell: (job: any) => formatDate(job.createdAt),
    },
    {
      header: 'Actions',
      accessorKey: 'id',
      cell: (job: any) => (
        <div className="flex gap-2">
          <Button size="icon" variant="ghost" asChild title="View Details">
            <Link href={`/${locale}/admin/jobs/${job.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          {job.status === 'PENDING_APPROVAL' && (
            <>
              <Button
                size="icon"
                variant="ghost"
                className="text-success"
                onClick={() => updateStatus({ id: job.id, status: 'ACTIVE' })}
                title={t('approve')}
              >
                <CheckCircle className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="text-destructive"
                onClick={() => {
                  const reason = prompt(t('reasonForRejection'));
                  if (reason) {
                    updateStatus({ id: job.id, status: 'REJECTED', reason });
                  }
                }}
                title={t('reject')}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Input
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-4"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="p-8 text-center">{common('loading')}</div>
      ) : (
        <DataTable data={filteredJobs || []} columns={columns} />
      )}
    </div>
  );
}
