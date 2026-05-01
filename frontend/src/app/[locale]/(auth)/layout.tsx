import React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations('Common');

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <header className="w-full p-6 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2 rtl:space-x-reverse">
          <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            {t('title')}
          </span>
        </Link>
        <LanguageSwitcher />
      </header>

      <main className="flex-grow flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">{children}</div>
      </main>

      <footer className="w-full p-6 text-center text-gray-500 text-sm">
        <p>
          &copy; {new Date().getFullYear()} {t('title')}. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
