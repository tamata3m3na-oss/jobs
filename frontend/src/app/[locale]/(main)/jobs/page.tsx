'use client';

import React, { useState, useMemo } from 'react';
import { Link, useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';
import { useJobs, Job } from '@/hooks/useJobs';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyStateNoResults } from '@/components/ui/EmptyState';
import {
  Search,
  MapPin,
  DollarSign,
  Briefcase,
  Clock,
  Bookmark,
  BookmarkCheck,
  Filter,
  X,
  ChevronDown,
} from 'lucide-react';

const JOB_TYPE_OPTIONS = [
  { value: 'FULL_TIME', label: 'Full Time' },
  { value: 'PART_TIME', label: 'Part Time' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'INTERNSHIP', label: 'Internship' },
  { value: 'TEMPORARY', label: 'Temporary' },
  { value: 'REMOTE', label: 'Remote' },
];

const EXPERIENCE_OPTIONS = [
  { value: 'ENTRY', label: 'Entry Level' },
  { value: 'JUNIOR', label: 'Junior' },
  { value: 'MID', label: 'Mid Level' },
  { value: 'SENIOR', label: 'Senior' },
  { value: 'LEAD', label: 'Lead' },
  { value: 'EXECUTIVE', label: 'Executive' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'relevance', label: 'Relevance' },
  { value: 'salary_high', label: 'Highest Salary' },
  { value: 'salary_low', label: 'Lowest Salary' },
];

const POSTED_WITHIN_OPTIONS = [
  { value: '24h', label: 'Last 24 hours' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: 'all', label: 'All time' },
];

function formatSalary(salary?: { min: number; max: number; currency: string }) {
  if (!salary) return null;
  const currency = salary.currency || 'USD';
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  });
  return `${formatter.format(salary.min)} - ${formatter.format(salary.max)}`;
}

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

interface JobCardProps {
  job: Job;
  onToggleSave: (jobId: string, isSaved: boolean) => void;
  isSaving: boolean;
}

function JobCard({ job, onToggleSave, isSaving }: JobCardProps) {
  const t = useTranslations('Jobs');

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
              {job.employer.logoUrl ? (
                <img
                  src={job.employer.logoUrl}
                  alt={job.employer.companyName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-lg font-bold text-muted-foreground">
                  {job.employer.companyName.charAt(0)}
                </span>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {job.matchScore && job.matchScore >= 80 && (
                <Badge variant="success" size="sm">
                  {t('topMatch')}
                </Badge>
              )}
              {job.location.isRemote && (
                <Badge variant="info" size="sm">
                  Remote
                </Badge>
              )}
            </div>

            <Link href={`/jobs/${job.slug}`} className="block group">
              <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                {job.title}
              </h3>
            </Link>

            <p className="text-sm text-muted-foreground mb-3">{job.employer.companyName}</p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              {job.location.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {job.location.city}
                  {job.location.country && `, ${job.location.country}`}
                </span>
              )}

              {job.salary && (
                <span className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  {formatSalary(job.salary)}
                </span>
              )}

              <span className="flex items-center gap-1">
                <Briefcase className="h-4 w-4" />
                {job.jobType.replace('_', ' ')}
              </span>

              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatDate(job.createdAt)}
              </span>
            </div>

            {job.skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {job.skills.slice(0, 4).map((skill) => (
                  <Badge key={skill} variant="outline" size="sm">
                    {skill}
                  </Badge>
                ))}
                {job.skills.length > 4 && (
                  <Badge variant="outline" size="sm">
                    +{job.skills.length - 4}
                  </Badge>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-3 lg:min-w-[120px]">
            {job.matchScore && (
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
                      strokeDasharray={`${job.matchScore * 1.26} 126`}
                      className={
                        job.matchScore >= 80
                          ? 'text-green-500'
                          : job.matchScore >= 50
                            ? 'text-yellow-500'
                            : 'text-gray-400'
                      }
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                    {job.matchScore}%
                  </span>
                </div>
                <span className="text-xs text-muted-foreground mt-1">{t('matchScore')}</span>
              </div>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleSave(job.id, job.isSaved || false)}
              disabled={isSaving}
              className="text-muted-foreground hover:text-primary"
            >
              {job.isSaved ? (
                <BookmarkCheck className="h-5 w-5" />
              ) : (
                <Bookmark className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function JobCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-start gap-4">
          <Skeleton variant="rectangular" width={48} height={48} />
          <div className="flex-1 space-y-3">
            <div className="flex gap-2">
              <Skeleton variant="text" width={60} height={20} />
              <Skeleton variant="text" width={60} height={20} />
            </div>
            <Skeleton variant="text" width="70%" height={24} />
            <Skeleton variant="text" width="40%" height={16} />
            <div className="flex gap-4">
              <Skeleton variant="text" width={100} height={14} />
              <Skeleton variant="text" width={100} height={14} />
              <Skeleton variant="text" width={80} height={14} />
            </div>
            <div className="flex gap-2">
              <Skeleton variant="text" width={60} height={20} />
              <Skeleton variant="text" width={60} height={20} />
              <Skeleton variant="text" width={60} height={20} />
            </div>
          </div>
          <div className="flex flex-col items-end gap-3">
            <Skeleton variant="circular" width={48} height={48} />
            <Skeleton variant="rectangular" width={32} height={32} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FiltersSidebar({
  filters,
  onFilterChange,
  onClearFilters,
}: {
  filters: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
  onClearFilters: () => void;
}) {
  const t = useTranslations('Jobs');
  const [isExpanded, setIsExpanded] = useState(false);

  const hasActiveFilters = Object.values(filters).some((v) => v && v !== 'all');

  return (
    <div className="lg:w-64 flex-shrink-0">
      <div className="sticky top-4 bg-card border rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Filter className="h-4 w-4" />
            {t('filters')}
          </h3>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-muted-foreground hover:text-destructive"
            >
              {t('clear')}
            </Button>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">{t('jobType')}</label>
            <Select
              options={JOB_TYPE_OPTIONS}
              value={filters.jobType || ''}
              onChange={(value) => onFilterChange('jobType', value)}
              placeholder={t('selectJobType')}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">{t('experienceLevel')}</label>
            <Select
              options={EXPERIENCE_OPTIONS}
              value={filters.experienceLevel || ''}
              onChange={(value) => onFilterChange('experienceLevel', value)}
              placeholder={t('selectExperience')}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">{t('postedWithin')}</label>
            <Select
              options={POSTED_WITHIN_OPTIONS}
              value={filters.postedWithin || 'all'}
              onChange={(value) => onFilterChange('postedWithin', value)}
              placeholder={t('selectTime')}
            />
          </div>

          <div className="pt-4 border-t">
            <label className="text-sm font-medium mb-2 block">{t('salaryRange')}</label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={filters.salaryMin || ''}
                onChange={(e) => onFilterChange('salaryMin', e.target.value)}
                className="w-24"
              />
              <Input
                type="number"
                placeholder="Max"
                value={filters.salaryMax || ''}
                onChange={(e) => onFilterChange('salaryMax', e.target.value)}
                className="w-24"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function JobsPage() {
  const t = useTranslations('Jobs');
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState<number>(1);
  const [showFilters, setShowFilters] = useState(false);

  const jobFilters = useMemo(
    () => ({
      keyword: searchQuery,
      location: locationQuery,
      ...filters,
      salaryMin: filters.salaryMin ? parseInt(filters.salaryMin) : undefined,
      salaryMax: filters.salaryMax ? parseInt(filters.salaryMax) : undefined,
    }),
    [searchQuery, locationQuery, filters]
  );

  const { jobs, total, totalPages, isLoading, saveJob, unsaveJob, isSaving } = useJobs(
    jobFilters,
    1 as const
  );

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({});
    setPage(1);
  };

  const handleToggleSave = async (jobId: string, isSaved: boolean) => {
    if (isSaved) {
      await unsaveJob(jobId);
    } else {
      await saveJob(jobId);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">{t('findYourDreamJob')}</h1>
          <p className="text-muted-foreground mb-6">{t('searchThousands')}</p>

          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3 max-w-4xl">
            <div className="flex-1">
              <Input
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
                className="w-full"
              />
            </div>
            <div className="flex-1">
              <Input
                placeholder={t('locationPlaceholder')}
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                leftIcon={<MapPin className="h-4 w-4" />}
                className="w-full"
              />
            </div>
            <Button type="submit" size="lg">
              {t('search')}
            </Button>
          </form>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <FiltersSidebar
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <p className="text-muted-foreground">
                {total} {t('jobsFound')}
              </p>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {t('filters')}
                  {Object.values(filters).some((v) => v) && (
                    <Badge variant="default" size="sm" className="ml-2">
                      {Object.values(filters).filter((v) => v).length}
                    </Badge>
                  )}
                </Button>
                <Select
                  options={SORT_OPTIONS}
                  value={sortBy}
                  onChange={setSortBy}
                  className="w-40"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <JobCardSkeleton key={i} />
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <EmptyStateNoResults searchQuery={searchQuery} />
            ) : (
              <>
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      onToggleSave={handleToggleSave}
                      isSaving={isSaving}
                    />
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
      </div>
    </div>
  );
}
