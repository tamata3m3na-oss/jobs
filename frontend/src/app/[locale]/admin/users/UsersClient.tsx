'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAdminUsers } from '@/hooks/useAdmin';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
import { User } from '@smartjob/shared';
import { Eye, Edit, Trash2, ShieldAlert, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Input } from '@/components/ui/Input';

export default function AdminUsersPage() {
  const t = useTranslations('admin.users');
  const common = useTranslations('Common');
  const { locale } = useParams();
  const { users, isLoading, updateStatus, deleteUser } = useAdminUsers();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users?.filter(
    (user: User) =>
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      header: t('allUsers'),
      accessorKey: 'firstName' as keyof User,
      cell: (user: User) => (
        <div className="flex flex-col">
          <span className="font-medium">{`${user.firstName} ${user.lastName}`}</span>
          <span className="text-xs text-muted-foreground">{user.email}</span>
        </div>
      ),
    },
    {
      header: t('role'),
      accessorKey: 'role' as keyof User,
      cell: (user: User) => (
        <Badge variant="secondary" className="capitalize">
          {user.role.replace('_', ' ').toLowerCase()}
        </Badge>
      ),
    },
    {
      header: t('status'),
      accessorKey: 'status' as keyof User,
      cell: (user: User) => (
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
      ),
    },
    {
      header: t('joinedDate'),
      accessorKey: 'createdAt' as keyof User,
      cell: (user: User) => formatDate(user.createdAt),
    },
    {
      header: t('actions'),
      accessorKey: 'id' as keyof User,
      cell: (user: User) => (
        <div className="flex gap-2">
          <Button size="icon" variant="ghost" asChild title={t('viewProfile')}>
            <Link href={`/${locale}/admin/users/${user.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          {user.status === 'ACTIVE' ? (
            <Button
              size="icon"
              variant="ghost"
              className="text-destructive"
              onClick={() => updateStatus({ id: user.id, status: 'SUSPENDED' })}
              title={t('suspendUser')}
            >
              <ShieldAlert className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              size="icon"
              variant="ghost"
              className="text-success"
              onClick={() => updateStatus({ id: user.id, status: 'ACTIVE' })}
              title={t('reactivateUser')}
            >
              <ShieldCheck className="h-4 w-4" />
            </Button>
          )}
          <Button
            size="icon"
            variant="ghost"
            className="text-destructive"
            onClick={() => {
              if (confirm(t('confirmDelete'))) {
                deleteUser(user.id);
              }
            }}
            title={t('deleteUser')}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Input
            placeholder={t('searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-4"
          />
        </div>
        {/* Additional filters could go here */}
      </div>

      {isLoading ? (
        <div className="p-8 text-center">{common('loading')}</div>
      ) : (
        <DataTable data={filteredUsers || []} columns={columns} />
      )}
    </div>
  );
}
