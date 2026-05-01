'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useAdminJob, useAdminJobs } from '@/hooks/useAdmin';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Building,
  MapPin,
  Calendar,
  DollarSign,
  Clock,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminJobReviewPage() {
  const t = useTranslations('admin.jobs');
  const common = useTranslations('Common');
  const { id, locale } = useParams();
  const router = useRouter();
  const { job, isLoading, error } = useAdminJob(id as string);
  const { updateStatus } = useAdminJobs();

  if (isLoading) return <div className="p-8 text-center">{common('loading')}</div>;
  if (error || !job)
    return <div className="p-8 text-center text-destructive">{common('error')}</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/${locale}/admin/jobs`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{job.title}</h1>
          <p className="text-muted-foreground">{job.companyName}</p>
        </div>
        <div className="ml-auto flex gap-2">
          {job.status === 'PENDING_APPROVAL' && (
            <>
              <Button
                variant="outline"
                className="text-success border-success hover:bg-success/10"
                onClick={() => {
                  updateStatus({ id: job.id, status: 'ACTIVE' });
                  router.push(`/${locale}/admin/jobs`);
                }}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                {t('approve')}
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  const reason = prompt(t('reasonForRejection'));
                  if (reason) {
                    updateStatus({ id: job.id, status: 'REJECTED', reason });
                    router.push(`/${locale}/admin/jobs`);
                  }
                }}
              >
                <XCircle className="mr-2 h-4 w-4" />
                {t('reject')}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: job.description }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: job.requirements }}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Building className="h-4 w-4 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{job.companyName}</span>
                  <Link
                    href={`/${locale}/admin/users/${job.employerId}`}
                    className="text-xs text-primary hover:underline"
                  >
                    View Employer Profile
                  </Link>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{job.location}</span>
              </div>
              <div className="flex items-center gap-3">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {job.salaryMin} - {job.salaryMax} {job.currency}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm capitalize">
                  {job.type.replace('_', ' ').toLowerCase()}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Posted {formatDate(job.createdAt)}</span>
              </div>
              <div className="pt-2 border-t">
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
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('moderationHistory')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground italic">
                No moderation history for this job posting.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
