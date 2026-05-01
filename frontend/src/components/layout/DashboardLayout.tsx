'use client';

import * as React from 'react';
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
}

const defaultNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Jobs',
    href: '/dashboard/jobs',
    icon: Briefcase,
    children: [
      { title: 'All Jobs', href: '/dashboard/jobs' },
      { title: 'Post New Job', href: '/dashboard/jobs/new' },
    ],
  },
  {
    title: 'Candidates',
    href: '/dashboard/candidates',
    icon: Users,
    roles: ['employer', 'admin'],
  },
  {
    title: 'Applications',
    href: '/dashboard/applications',
    icon: FileText,
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
];

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Skip to content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:p-4 focus:bg-primary focus:text-primary-foreground"
      >
        Skip to content
      </a>

      {/* Desktop Sidebar */}
      <Sidebar
        items={defaultNavItems}
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
              <span className="font-bold text-xl text-primary">SmartJob</span>
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                <X size={20} />
              </Button>
            </div>
            <Sidebar
              items={defaultNavItems}
              user={user}
              collapsed={false}
              className="border-none"
            />
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
