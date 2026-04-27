'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { BarChartComponent, PieChartComponent } from '@/components/ui/Charts';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { Briefcase, Users, CheckCircle, XCircle } from 'lucide-react';
import { DataTable } from '@/components/ui/DataTable';

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

export default function EmployerDashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['employer-stats'],
    queryFn: async () => {
      const response = await apiClient.get('/analytics/employer');
      return response.data;
    },
  });

  if (isLoading) return <div className="p-8 text-center">Loading dashboard...</div>;

  const appStatusData =
    stats?.applicationsByStatus?.map((item: AppStatus) => ({
      name: item.status,
      value: parseInt(item.count),
    })) || [];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Employer Dashboard</h1>
        <p className="text-muted-foreground">Manage your job postings and candidates.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalJobs || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalApplications || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shortlisted</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.applicationsByStatus?.find((a: AppStatus) => a.status === 'SHORTLISTED')?.count || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.applicationsByStatus?.find((a: AppStatus) => a.status === 'REJECTED')?.count || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Application Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChartComponent data={appStatusData} xKey="name" yKey="value" color="#10b981" />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Job Views vs Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChartComponent
              data={[
                {
                  name: 'Views',
                  value:
                    stats?.jobPerformance?.reduce(
                      (acc: number, j: JobPerformance) => acc + (j.views || 0),
                      0
                    ) || 0,
                },
                { name: 'Applications', value: stats?.totalApplications || 0 },
              ]}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Job Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={stats?.jobPerformance || []}
            columns={[
              { header: 'Job Title', accessorKey: 'title' },
              { header: 'Views', accessorKey: 'views' },
              { header: 'Applications', accessorKey: 'applicationsCount' },
              {
                header: 'Conversion Rate',
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
