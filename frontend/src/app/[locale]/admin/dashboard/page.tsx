'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { LineChartComponent, BarChartComponent, PieChartComponent } from '@/components/ui/Charts';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { Users, Briefcase, Clock, Activity } from 'lucide-react';

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const response = await apiClient.get('/analytics/admin');
      return response.data;
    },
  });

  if (isLoading) return <div className="p-8 text-center">Loading dashboard...</div>;

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

  // Mock revenue data for the chart
  const revenueData = [
    { month: 'Jan', amount: 4000 },
    { month: 'Feb', amount: 3000 },
    { month: 'Mar', amount: 2000 },
    { month: 'Apr', amount: 2780 },
    { month: 'May', amount: 1890 },
    { month: 'Jun', amount: 2390 },
    { month: 'Jul', amount: 3490 },
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s what&apos;s happening with the system.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.overview?.totalUsers || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.overview?.totalJobs || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Applications</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.overview?.totalApplications || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">Healthy</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Revenue Over Time</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <LineChartComponent data={revenueData} xKey="month" yKey="amount" />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Users by Role</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChartComponent data={usersByRoleData} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Jobs by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChartComponent data={jobsByStatusData} xKey="name" yKey="value" />
          </CardContent>
        </Card>
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>System Performance</CardTitle>
            <CardDescription>Server response time (ms)</CardDescription>
          </CardHeader>
          <CardContent>
            <LineChartComponent
              data={[
                { time: '10:00', ms: 45 },
                { time: '11:00', ms: 52 },
                { time: '12:00', ms: 38 },
                { time: '13:00', ms: 65 },
                { time: '14:00', ms: 48 },
                { time: '15:00', ms: 42 },
              ]}
              xKey="time"
              yKey="ms"
              color="#10b981"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
