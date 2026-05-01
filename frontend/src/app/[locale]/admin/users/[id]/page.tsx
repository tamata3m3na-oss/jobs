'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useAdminUser, useAdminUsers } from '@/hooks/useAdmin';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Shield,
  Activity,
  Briefcase,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminUserDetailPage() {
  const t = useTranslations('admin.users');
  const common = useTranslations('Common');
  const { id, locale } = useParams();
  const router = useRouter();
  const { user, isLoading, error } = useAdminUser(id as string);
  const { updateStatus, deleteUser } = useAdminUsers();

  if (isLoading) return <div className="p-8 text-center">{common('loading')}</div>;
  if (error || !user)
    return <div className="p-8 text-center text-destructive">{common('error')}</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/${locale}/admin/users`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {user.firstName} {user.lastName}
          </h1>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
        <div className="ml-auto flex gap-2">
          {user.status === 'ACTIVE' ? (
            <Button
              variant="outline"
              className="text-destructive"
              onClick={() => updateStatus({ id: user.id, status: 'SUSPENDED' })}
            >
              {t('suspendUser')}
            </Button>
          ) : (
            <Button
              variant="outline"
              className="text-success"
              onClick={() => updateStatus({ id: user.id, status: 'ACTIVE' })}
            >
              {t('reactivateUser')}
            </Button>
          )}
          <Button
            variant="destructive"
            onClick={() => {
              if (confirm(t('confirmDelete'))) {
                deleteUser(user.id);
                router.push(`/${locale}/admin/users`);
              }
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {t('deleteUser')}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{user.email}</span>
            </div>
            {user.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{user.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <Badge variant="secondary" className="capitalize">
                {user.role.replace('_', ' ').toLowerCase()}
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <Badge
                variant={
                  user.status === 'ACTIVE'
                    ? 'success'
                    : user.status === 'SUSPENDED'
                      ? 'destructive'
                      : 'outline'
                }
              >
                {t(user.status.toLowerCase())}
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Joined {formatDate(user.createdAt)}</span>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Activity History</CardTitle>
              <CardDescription>Recent actions performed by the user</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Mock activity history */}
                <div className="flex items-start gap-4 pb-4 border-b">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                    <Activity className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Logged into the system</p>
                    <p className="text-xs text-muted-foreground">Today at 10:45 AM</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 pb-4 border-b">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                    <Edit className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Updated profile information</p>
                    <p className="text-xs text-muted-foreground">Yesterday at 3:20 PM</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {user.role === 'EMPLOYER' && (
            <Card>
              <CardHeader>
                <CardTitle>Job Postings</CardTitle>
                <CardDescription>Jobs posted by this employer</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center p-8 text-muted-foreground">
                  <Briefcase className="mr-2 h-4 w-4" />
                  No jobs posted yet
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
