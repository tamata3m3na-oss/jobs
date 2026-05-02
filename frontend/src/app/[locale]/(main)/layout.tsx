'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname, Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/layouts/Navbar';
import {
  Home,
  Briefcase,
  FileText,
  User,
  Settings,
  Bell,
  LogOut,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

function UserMenu({ user }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations('Navigation');

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
          {user?.firstName?.[0]}
          {user?.lastName?.[0]}
        </div>
        <span className="hidden md:inline text-sm font-medium">
          {user?.firstName} {user?.lastName}
        </span>
        <ChevronDown className="h-4 w-4" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-56 bg-card border rounded-lg shadow-lg z-50 py-1">
            <div className="px-4 py-3 border-b">
              <p className="text-sm font-medium">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <Link
              href="/profile"
              className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent"
              onClick={() => setIsOpen(false)}
            >
              <span className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {t('profile')}
              </span>
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent"
              onClick={() => setIsOpen(false)}
            >
              <span className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                {t('settings')}
              </span>
            </Link>
            <div className="border-t my-1" />
            <button className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent w-full text-left text-destructive">
              <LogOut className="h-4 w-4" />
              {t('logout')}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function MobileNav({
  navItems,
  isOpen,
  onClose,
}: {
  navItems: NavItem[];
  isOpen: boolean;
  onClose: () => void;
}) {
  const t = useTranslations('Navigation');

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />}
      <div
        className={cn(
          'fixed inset-y-0 left-0 w-64 bg-card border-r z-50 transform transition-transform lg:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <span className="font-bold text-lg">{t('menu')}</span>
          <button onClick={onClose} className="p-2 hover:bg-accent rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors"
              onClick={onClose}
            >
              <span className="flex items-center gap-3 w-full">
                {item.icon}
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <Badge variant="default" size="sm" className="ml-auto">
                    {item.badge}
                  </Badge>
                )}
              </span>
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations('Navigation');
  const commonT = useTranslations('Common');
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: NavItem[] = [
    { label: t('dashboard'), href: '/', icon: <Home className="h-5 w-5" /> },
    { label: t('jobs'), href: '/jobs', icon: <Briefcase className="h-5 w-5" /> },
    { label: t('applications'), href: '/applications', icon: <FileText className="h-5 w-5" /> },
    { label: t('profile'), href: '/profile', icon: <User className="h-5 w-5" /> },
    { label: t('settings'), href: '/settings', icon: <Settings className="h-5 w-5" /> },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 bg-card border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                className="p-2 hover:bg-accent rounded-lg lg:hidden"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </button>
              <Link href="/" className="text-xl font-bold text-primary">
                {commonT('title')}
              </Link>
            </div>

            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    )}
                  >
                    <span className="flex items-center gap-2">
                      {item.icon}
                      {item.label}
                      {item.badge !== undefined && item.badge > 0 && (
                        <Badge variant="default" size="sm" className="ml-1">
                          {item.badge}
                        </Badge>
                      )}
                    </span>
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-3">
              <button className="relative p-2 hover:bg-accent rounded-lg">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
              </button>
              <UserMenu user={{ firstName: 'John', lastName: 'Doe', email: 'john@example.com' }} />
            </div>
          </div>
        </div>
      </header>

      <MobileNav
        navItems={navItems}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <main className="flex-1">{children}</main>

      <footer className="border-t py-6 mt-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} {t('allRightsReserved')}
            </p>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-foreground">
                {t('privacyPolicy')}
              </Link>
              <Link href="/terms" className="hover:text-foreground">
                {t('termsOfService')}
              </Link>
              <Link href="/contact" className="hover:text-foreground">
                {t('contact')}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ProtectedRouteWrapper({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedRouteWrapper>{children}</ProtectedRouteWrapper>;
}

export { DashboardLayout };
