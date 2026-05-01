'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({ children, redirectTo = '/login' }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Store the intended destination
      const encodedRedirect = encodeURIComponent(pathname);
      router.push(`${redirectTo}?redirect=${encodedRedirect}`);
    }
  }, [isAuthenticated, isLoading, router, pathname, redirectTo]);

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

  return <>{children}</>;
}
