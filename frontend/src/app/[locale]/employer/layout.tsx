'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { LayoutDashboard, Briefcase, FileText, Building, Settings, PlusCircle } from 'lucide-react';
import { USER_ROLES } from '@/lib/constants';

const employerNavItems = [
  {
    title: 'Dashboard',
    href: '/employer/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Jobs',
    href: '/employer/jobs',
    icon: Briefcase,
    children: [
      { title: 'All Jobs', href: '/employer/jobs' },
      { title: 'Post New Job', href: '/employer/jobs/new' },
    ],
  },
  {
    title: 'Applications',
    href: '/employer/applications',
    icon: FileText,
  },
  {
    title: 'Company Profile',
    href: '/employer/profile',
    icon: Building,
  },
  {
    title: 'Settings',
    href: '/employer/settings',
    icon: Settings,
  },
];

export default function EmployerLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/${locale}/login`);
    } else if (!isLoading && user && user.role !== USER_ROLES.EMPLOYER) {
      router.push(`/${locale}/dashboard`);
    }
  }, [isAuthenticated, isLoading, user, router, locale]);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated || (user && user.role !== USER_ROLES.EMPLOYER)) {
    return null;
  }

  return (
    <DashboardLayout
      user={
        user
          ? {
              name: `${user.firstName} ${user.lastName}`,
              email: user.email,
              role: user.role,
              avatar: user.avatarUrl,
            }
          : undefined
      }
      navItems={employerNavItems}
    >
      {children}
    </DashboardLayout>
  );
}
