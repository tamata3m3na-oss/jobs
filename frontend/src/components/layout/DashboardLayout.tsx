'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '../../lib/utils';
import { Sidebar, NavItem } from './Sidebar';
import { Header } from './Header';
import { Footer } from './Footer';
import { LayoutDashboard, Briefcase, Users, FileText, Settings, X } from 'lucide-react';
import { Button } from '../ui/Button';

interface DashboardLayoutProps {
  children: React.ReactNode;
  user?: {
    name: string;
    email: string;
    avatar?: string;
    role: string;
  };
  navItems?: NavItem[];
}

export function DashboardLayout({ children, user, navItems }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const t = useTranslations('Navigation');
  const commonT = useTranslations('Common');

  const defaultNavItems: NavItem[] = [
    {
      title: t('dashboard'),
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: t('jobs'),
      href: '/dashboard/jobs',
      icon: Briefcase,
      children: [
        { title: t('allJobs'), href: '/dashboard/jobs' },
        { title: t('postJob'), href: '/dashboard/jobs/new' },
      ],
    },
    {
      title: t('candidates'),
      href: '/dashboard/candidates',
      icon: Users,
      roles: ['employer', 'admin'],
    },
    {
      title: t('applications'),
      href: '/dashboard/applications',
      icon: FileText,
    },
    {
      title: t('settings'),
      href: '/dashboard/settings',
      icon: Settings,
    },
  ];

  const items = navItems || defaultNavItems;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Skip to content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:p-4 focus:bg-primary focus:text-primary-foreground"
      >
        {t('skipToContent')}
      </a>

      {/* Desktop Sidebar */}
      <Sidebar
        items={items}
        user={user}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="hidden md:flex sticky top-0"
      />

      {/* Mobile Sidebar (Drawer) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="fixed inset-y-0 left-0 w-64 bg-card border-r shadow-xl animate-slide-in-from-top duration-300">
            <div className="p-4 flex items-center justify-between border-b">
              <span className="font-bold text-xl text-primary">{commonT('title')}</span>
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                <X size={20} />
              </Button>
            </div>
            <Sidebar items={items} user={user} collapsed={false} className="border-none" />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <Header user={user} onMenuClick={() => setIsMobileMenuOpen(true)} />

        <main id="main-content" className="flex-1 p-4 md:p-8 outline-none">
          {children}
        </main>

        <Footer className="mt-auto" />
      </div>
    </div>
  );
}
