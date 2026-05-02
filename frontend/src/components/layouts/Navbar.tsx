'use client';

import { Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from '../ui/LanguageSwitcher';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const t = useTranslations('Navigation');
  const ct = useTranslations('Common');
  const pathname = usePathname();

  // Hide navbar on admin and auth pages
  const isHideNavbar =
    pathname.includes('/admin') ||
    pathname.includes('/login') ||
    pathname.includes('/register') ||
    pathname.includes('/forgot-password');

  if (isHideNavbar) {
    return null;
  }

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-2xl font-bold text-indigo-600">
                <span>{ct('title')}</span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8 rtl:space-x-reverse">
              <Link
                href="/jobs"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                <span>{t('jobs')}</span>
              </Link>
              <Link
                href="/applications"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                <span>{t('applications')}</span>
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <LanguageSwitcher />
            <Link
              href="/login"
              className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
            >
              <span>{ct('login')}</span>
            </Link>
            <Link
              href="/register"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
            >
              <span>{ct('register')}</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
