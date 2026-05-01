import * as React from 'react';
import { Link } from '@/navigation';
import { cn } from '../../lib/utils';

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={cn('bg-background border-t', className)}>
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="text-2xl font-bold text-primary">
              SmartJob
            </Link>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              Empowering the future of recruitment with AI-driven matching and seamless job search
              experience.
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
            <h3 className="text-sm font-semibold uppercase tracking-wider">For Job Seekers</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/jobs"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link
                  href="/companies"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Browse Companies
                </Link>
              </li>
              <li>
                <Link
                  href="/applications"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  My Applications
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider">For Employers</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/employer/post-job"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Post a Job
                </Link>
              </li>
              <li>
                <Link
                  href="/employer/dashboard"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Employer Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Pricing Plans
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider">Company</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © {currentYear} SmartJob Platform. All rights reserved.
          </p>
          <div className="flex space-x-6 rtl:space-x-reverse text-xs text-muted-foreground">
            <span>Made with ❤️ for recruiters and job seekers.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
