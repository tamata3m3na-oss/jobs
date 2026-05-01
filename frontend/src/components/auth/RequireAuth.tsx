'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { USER_ROLES, type UserRole } from '@/lib/constants';

interface RequireAuthProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
  show403?: boolean;
}

export function RequireAuth({
  children,
  allowedRoles = [USER_ROLES.JOB_SEEKER, USER_ROLES.EMPLOYER, USER_ROLES.ADMIN],
  redirectTo = '/login',
  show403 = false,
}: RequireAuthProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      // Store the intended destination
      const encodedRedirect = encodeURIComponent(pathname);
      router.push(`${redirectTo}?redirect=${encodedRedirect}`);
      return;
    }

    if (user && allowedRoles.length > 0 && !allowedRoles.includes(user.role as UserRole)) {
      if (show403) {
        return; // Will render 403 component below
      }
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router, pathname, redirectTo, user, allowedRoles, show403]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // User is authenticated but role is not allowed and we're showing 403
  if (user && allowedRoles.length > 0 && !allowedRoles.includes(user.role as UserRole) && show403) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">403</h1>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Access Forbidden
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You do not have permission to access this page.
          </p>
          <a
            href="/dashboard"
            className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  // User is authenticated and has allowed role
  return <>{children}</>;
}
