'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { USER_ROLES, type UserRole } from '@/lib/constants';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallbackPath?: string;
  show403?: boolean;
}

export function RoleGuard({
  children,
  allowedRoles,
  fallbackPath = '/dashboard',
  show403 = false,
}: RoleGuardProps) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user && !allowedRoles.includes(user.role as UserRole)) {
      if (!show403) {
        router.push(fallbackPath);
      }
    }
  }, [user, isAuthenticated, isLoading, router, allowedRoles, fallbackPath, show403]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // User is authenticated but role is not allowed and we're showing 403
  if (user && !allowedRoles.includes(user.role as UserRole) && show403) {
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
            href={fallbackPath}
            className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  // User is authenticated and has allowed role
  if (user && allowedRoles.includes(user.role as UserRole)) {
    return <>{children}</>;
  }

  return null;
}
