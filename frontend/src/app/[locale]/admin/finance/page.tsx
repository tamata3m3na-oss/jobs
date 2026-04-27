'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { LineChartComponent, BarChartComponent } from '@/components/ui/Charts';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { DollarSign, CreditCard, TrendingUp, Users } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function AdminFinancePage() {
  const { data: revenue, isLoading } = useQuery({
    queryKey: ['revenue-stats'],
    queryFn: async () => {
      const response = await apiClient.get('/analytics/revenue');
      return response.data;
    },
  });

  if (isLoading) return <div className="p-8 text-center">Loading finance data...</div>;

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Finance & Analytics</h1>
        <p className="text-muted-foreground">Monitor revenue and subscription performance.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(revenue?.totalRevenue || 0, revenue?.currency)}
            </div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{revenue?.subscriptions?.active || 0}</div>
            <p className="text-xs text-muted-foreground">+4 new this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Revenue Per User</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(342.5)}</div>
            <p className="text-xs text-muted-foreground">+5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trial Conversion</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12.5%</div>
            <p className="text-xs text-muted-foreground">+2% from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Revenue History</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChartComponent data={revenue?.revenueHistory || []} xKey="month" yKey="amount" />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Subscription Status</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChartComponent
              data={[
                { name: 'Active', value: revenue?.subscriptions?.active || 0 },
                { name: 'Trial', value: revenue?.subscriptions?.trial || 0 },
                { name: 'Expired', value: revenue?.subscriptions?.expired || 0 },
              ]}
              xKey="name"
              yKey="value"
              color="#8b5cf6"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
