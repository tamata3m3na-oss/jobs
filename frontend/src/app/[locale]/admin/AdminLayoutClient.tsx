'use client';

import React, { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { LayoutDashboard, Users, Briefcase, Settings, ShieldAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('admin.nav');

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'ADMIN')) {
      router.push(`/${locale}/login`);
    }
  }, [isAuthenticated, user, isLoading, router, locale]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return null;
  }

  const adminNavItems = [
    {
      title: t('dashboard'),
      href: `/${locale}/admin/dashboard`,
      icon: LayoutDashboard,
    },
    {
      title: t('users'),
      href: `/${locale}/admin/users`,
      icon: Users,
    },
    {
      title: t('jobs'),
      href: `/${locale}/admin/jobs`,
      icon: Briefcase,
    },
    {
      title: t('settings'),
      href: `/${locale}/admin/settings`,
      icon: Settings,
    },
  ];

  return (
    <DashboardLayout
      user={{
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      }}
      navItems={adminNavItems}
    >
      {children}
    </DashboardLayout>
  );
}
