'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { LineChartComponent, BarChartComponent, PieChartComponent } from '@/components/ui/Charts';
import { Users, Briefcase, Clock, Activity, Flag, UserPlus, ShieldAlert } from 'lucide-react';
import { useAdminStats } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function AdminDashboardPage() {
  const t = useTranslations('admin.dashboard');
  const common = useTranslations('Common');
  const { locale } = useParams();
  const { data: stats, isLoading, error } = useAdminStats();

  if (error) {
    return (
      <div className="p-8 text-center text-destructive">
        {common('error')}: {error.message}
      </div>
    );
  }

  const usersByRoleData =
    stats?.usersByRole?.map((item: { role: string; count: string }) => ({
      name: item.role,
      value: parseInt(item.count),
    })) || [];

  const jobsByStatusData =
    stats?.jobsByStatus?.map((item: { status: string; count: string }) => ({
      name: item.status,
      value: parseInt(item.count),
    })) || [];

  // Mock data for charts if real data is not available yet
  const userGrowthData = [
    { date: '2023-01', count: 100 },
    { date: '2023-02', count: 150 },
    { date: '2023-03', count: 230 },
    { date: '2023-04', count: 320 },
    { date: '2023-05', count: 450 },
    { date: '2023-06', count: 600 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t('totalUsers')}
          value={stats?.overview?.totalUsers}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          loading={isLoading}
        />
        <StatCard
          title={t('totalJobs')}
          value={stats?.overview?.totalJobs}
          icon={<Briefcase className="h-4 w-4 text-muted-foreground" />}
          loading={isLoading}
        />
        <StatCard
          title={t('totalApplications')}
          value={stats?.overview?.totalApplications}
          icon={<Clock className="h-4 w-4 text-muted-foreground" />}
          loading={isLoading}
        />
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('systemHealth')}</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{t('healthy')}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>{t('userGrowth')}</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <LineChartComponent data={userGrowthData} xKey="date" yKey="count" />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>{t('quickActions')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href={`/${locale}/admin/users`}>
                <UserPlus className="mr-2 h-4 w-4" />
                {t('totalUsers')}
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href={`/${locale}/admin/jobs`}>
                <ShieldAlert className="mr-2 h-4 w-4" />
                {t('flaggedContent')}
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href={`/${locale}/admin/settings`}>
                <Activity className="mr-2 h-4 w-4" />
                {t('systemHealth')}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>{t('jobPostingsTrend')}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[200px] w-full" />
            ) : (
              <BarChartComponent data={jobsByStatusData} xKey="name" yKey="value" />
            )}
          </CardContent>
        </Card>
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>{t('recentRegistrations')}</CardTitle>
            <CardDescription>Latest users joined the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Mock recent users */}
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">User {i}</p>
                    <p className="text-xs text-muted-foreground">user{i}@example.com</p>
                  </div>
                  <div className="text-xs text-muted-foreground">2h ago</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  loading,
}: {
  title: string;
  value?: number;
  icon: React.ReactNode;
  loading?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <div className="text-2xl font-bold">{value || 0}</div>
        )}
      </CardContent>
    </Card>
  );
}
