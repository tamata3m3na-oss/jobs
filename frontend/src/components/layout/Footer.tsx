import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import { cn } from '../../lib/utils';

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  const t = useTranslations('Navigation');
  const commonT = useTranslations('Common');
  const currentYear = new Date().getFullYear();

  return (
    <footer className={cn('bg-background border-t', className)}>
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="text-2xl font-bold text-primary">
              {commonT('title')}
            </Link>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              {t('footerDescription')}
            </p>
            <div className="mt-6 flex space-x-4 rtl:space-x-reverse">
              <span
                className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                title="Twitter/X"
              >
                𝕏
              </span>
              <span
                className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                title="LinkedIn"
              >
                in
              </span>
              <span
                className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                title="Facebook"
              >
                f
              </span>
              <span
                className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                title="GitHub"
              >
                ⌘
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider">{t('forJobSeekers')}</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/jobs"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('browseJobs')}
                </Link>
              </li>
              <li>
                <Link
                  href="/companies"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('browseCompanies')}
                </Link>
              </li>
              <li>
                <Link
                  href="/applications"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('applications')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider">{t('forEmployers')}</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/employer/post-job"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('postJob')}
                </Link>
              </li>
              <li>
                <Link
                  href="/employer/dashboard"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('dashboard')}
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('pricingPlans')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider">{t('company')}</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('aboutUs')}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('contact')}
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('privacyPolicy')}
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('termsOfService')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © {currentYear} {t('allRightsReserved')}
          </p>
          <div className="flex space-x-6 rtl:space-x-reverse text-xs text-muted-foreground">
            <span>{t('madeWithLove')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
