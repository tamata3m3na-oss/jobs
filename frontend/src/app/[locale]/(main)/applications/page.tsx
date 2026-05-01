'use client';

import { useState, useMemo } from 'react';
import { Link, useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';
import {
  useApplications,
  Application,
  getStatusLabel,
  getStatusVariant,
  ApplicationStatus,
} from '@/hooks/useApplications';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyStateNoData } from '@/components/ui/EmptyState';
import {
  Briefcase,
  Building2,
  MapPin,
  Clock,
  DollarSign,
  Eye,
  ChevronRight,
  Inbox,
} from 'lucide-react';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'UNDER_REVIEW', label: 'Under Review' },
  { value: 'SHORTLISTED', label: 'Shortlisted' },
  { value: 'INTERVIEW_SCHEDULED', label: 'Interview Scheduled' },
  { value: 'INTERVIEW_COMPLETED', label: 'Interview Completed' },
  { value: 'OFFER_EXTENDED', label: 'Offer Extended' },
  { value: 'OFFER_ACCEPTED', label: 'Offer Accepted' },
  { value: 'OFFER_DECLINED', label: 'Offer Declined' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'WITHDRAWN', label: 'Withdrawn' },
];

const SORT_OPTIONS = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'status', label: 'By Status' },
];

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString();
}

interface ApplicationCardProps {
  application: Application;
}

function ApplicationCard({ application }: ApplicationCardProps) {
  const t = useTranslations('Applications');

  return (
    <Link href={`/applications/${application.id}`}>
      <Card className="hover:shadow-lg transition-shadow duration-200 group cursor-pointer">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                {application.employerLogo ? (
                  <img
                    src={application.employerLogo}
                    alt={application.employerName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant={getStatusVariant(application.status)}>
                  {getStatusLabel(application.status)}
                </Badge>
                {application.matchScore && application.matchScore >= 80 && (
                  <Badge variant="success" size="sm">
                    Top Match
                  </Badge>
                )}
              </div>

              <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                {application.jobTitle}
              </h3>

              <p className="text-sm text-muted-foreground mb-3">{application.employerName}</p>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Applied {formatDate(application.appliedAt)}
                </span>
                {application.statusHistory.length > 0 && (
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    Last update {formatDate(application.updatedAt)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 lg:flex-col lg:items-end">
              {application.matchScore && (
                <div className="flex flex-col items-center">
                  <div className="relative w-12 h-12">
                    <svg className="w-12 h-12 transform -rotate-90">
                      <circle
                        cx="24"
                        cy="24"
                        r="20"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        className="text-muted"
                      />
                      <circle
                        cx="24"
                        cy="24"
                        r="20"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray={`${application.matchScore * 1.26} 126`}
                        className={
                          application.matchScore >= 80
                            ? 'text-green-500'
                            : application.matchScore >= 50
                              ? 'text-yellow-500'
                              : 'text-gray-400'
                        }
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                      {application.matchScore}%
                    </span>
                  </div>
                </div>
              )}

              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function ApplicationCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-start gap-4">
          <Skeleton variant="rectangular" width={48} height={48} />
          <div className="flex-1 space-y-3">
            <div className="flex gap-2">
              <Skeleton variant="text" width={80} height={24} />
              <Skeleton variant="text" width={60} height={24} />
            </div>
            <Skeleton variant="text" width="70%" height={24} />
            <Skeleton variant="text" width="40%" height={16} />
            <div className="flex gap-4">
              <Skeleton variant="text" width={120} height={14} />
              <Skeleton variant="text" width={120} height={14} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Skeleton variant="circular" width={48} height={48} />
            <Skeleton variant="text" width={20} height={20} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatsCards({ applications }: { applications: Application[] }) {
  const t = useTranslations('Applications');

  const stats = useMemo(() => {
    const active = applications.filter(
      (a) => !['REJECTED', 'WITHDRAWN', 'OFFER_ACCEPTED', 'OFFER_DECLINED'].includes(a.status)
    ).length;
    const interviews = applications.filter((a) => a.status.startsWith('INTERVIEW')).length;
    const offers = applications.filter((a) =>
      ['OFFER_EXTENDED', 'OFFER_ACCEPTED'].includes(a.status)
    ).length;

    return { active, interviews, offers };
  }, [applications]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      <Card>
        <CardContent className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Briefcase className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.active}</p>
            <p className="text-sm text-muted-foreground">Active Applications</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <Eye className="h-6 w-6 text-green-500" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.interviews}</p>
            <p className="text-sm text-muted-foreground">Interviews</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <DollarSign className="h-6 w-6 text-purple-500" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.offers}</p>
            <p className="text-sm text-muted-foreground">Offers</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ApplicationsPage() {
  const t = useTranslations('Applications');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [page, setPage] = useState(1);

  const { applications, total, totalPages, isLoading, isError } = useApplications(
    { status: (statusFilter as ApplicationStatus) || undefined },
    page
  );

  const sortedApplications = useMemo(() => {
    const sorted = [...applications];

    switch (sortBy) {
      case 'oldest':
        return sorted.sort(
          (a, b) => new Date(a.appliedAt).getTime() - new Date(b.appliedAt).getTime()
        );
      case 'status':
        const statusOrder: Record<ApplicationStatus, number> = {
          SUBMITTED: 0,
          UNDER_REVIEW: 1,
          SHORTLISTED: 2,
          INTERVIEW_SCHEDULED: 3,
          INTERVIEW_COMPLETED: 4,
          OFFER_EXTENDED: 5,
          OFFER_ACCEPTED: 6,
          OFFER_DECLINED: 7,
          REJECTED: 8,
          WITHDRAWN: 9,
        };
        return sorted.sort((a, b) => (statusOrder[a.status] || 0) - (statusOrder[b.status] || 0));
      case 'recent':
      default:
        return sorted.sort(
          (a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
        );
    }
  }, [applications, sortBy]);

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="space-y-4">
            <StatsCards applications={[]} />
            {[...Array(5)].map((_, i) => (
              <ApplicationCardSkeleton key={i} />
            ))}
          </div>
        ) : applications.length === 0 ? (
          <EmptyStateNoData
            title={statusFilter ? 'No applications with this status' : 'No applications yet'}
            description={
              statusFilter
                ? 'Try changing the status filter to see more applications.'
                : 'Start applying to jobs to track your applications here.'
            }
          />
        ) : (
          <>
            <StatsCards applications={applications} />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <p className="text-muted-foreground">
                {total} {t('applicationsFound')}
              </p>
              <div className="flex items-center gap-4">
                <Select
                  options={STATUS_OPTIONS}
                  value={statusFilter}
                  onChange={handleStatusChange}
                  className="w-48"
                />
                <Select
                  options={SORT_OPTIONS}
                  value={sortBy}
                  onChange={setSortBy}
                  className="w-40"
                />
              </div>
            </div>

            <div className="space-y-4">
              {sortedApplications.map((application) => (
                <ApplicationCard key={application.id} application={application} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  {t('pageOf', { page, totalPages })}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
