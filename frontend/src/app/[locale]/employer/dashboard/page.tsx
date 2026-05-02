'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { BarChartComponent, PieChartComponent } from '@/components/ui/Charts';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { Briefcase, Users, CheckCircle, XCircle, PlusCircle, ArrowRight } from 'lucide-react';
import { DataTable } from '@/components/ui/DataTable';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useTranslations } from 'next-intl';

interface AppStatus {
  status: string;
  count: string;
}

interface JobPerformance {
  id: string;
  title: string;
  views: number;
  applicationsCount: number;
}

interface RecentApplication {
  id: string;
  candidateName: string;
  jobTitle: string;
  status: string;
  appliedAt: string;
  matchScore: number;
}

export default function EmployerDashboardPage() {
  const t = useTranslations('EmployerDashboard');
  const commonT = useTranslations('Common');
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ['employer-stats'],
    queryFn: async () => {
      const response = await apiClient.get('/analytics/employer');
      return response.data;
    },
  });

  if (isLoading) return <div className="p-8 text-center">{commonT('loading')}</div>;

  const appStatusData =
    stats?.applicationsByStatus?.map((item: AppStatus) => ({
      name: item.status,
      value: parseInt(item.count),
    })) || [];

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/employer/jobs/new">
              <span className="flex items-center">
                <PlusCircle className="mr-2 h-4 w-4" />
                {t('postNewJob')}
              </span>
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/employer/applications">{t('viewApplications')}</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('activeJobs')}</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalJobs || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalApplications')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalApplications || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('shortlisted')}</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.applicationsByStatus?.find((a: AppStatus) => a.status === 'SHORTLISTED')
                ?.count || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('rejected')}</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.applicationsByStatus?.find((a: AppStatus) => a.status === 'REJECTED')
                ?.count || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>{t('applicationPipeline')}</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChartComponent data={appStatusData} xKey="name" yKey="value" color="#10b981" />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>{t('recentApplications')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentApplications?.length > 0 ? (
                stats.recentApplications.map((app: RecentApplication) => (
                  <div key={app.id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{app.candidateName}</p>
                      <p className="text-xs text-muted-foreground">{app.jobTitle}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-xs font-bold text-green-600">{app.matchScore}%</div>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/employer/applications/${app.id}`}>
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {t('noRecentApplications')}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('jobPerformance')}</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={stats?.jobPerformance || []}
            columns={[
              { header: t('jobTitle'), accessorKey: 'title' },
              { header: t('views'), accessorKey: 'views' },
              { header: t('applications'), accessorKey: 'applicationsCount' },
              {
                header: t('conversionRate'),
                accessorKey: 'id',
                cell: (job: JobPerformance) => (
                  <span>
                    {job.views > 0 ? ((job.applicationsCount / job.views) * 100).toFixed(1) : 0}%
                  </span>
                ),
              },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}
