'use client';

import { use } from 'react';
import { Link, useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';
import { useJob, useToggleSaveJob, useRelatedJobs, JobDetail } from '@/hooks/useJob';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyStateError } from '@/components/ui/EmptyState';
import {
  MapPin,
  DollarSign,
  Briefcase,
  Clock,
  Bookmark,
  BookmarkCheck,
  Share2,
  Building2,
  Globe,
  Users,
  Calendar,
  CheckCircle2,
  ArrowLeft,
  ExternalLink,
} from 'lucide-react';

function formatSalary(salary?: any) {
  if (!salary) return null;
  const currency = salary.currency || 'USD';
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  });
  const period = salary.period?.toLowerCase() || '';
  return `${formatter.format(salary.min)} - ${formatter.format(salary.max)}${period ? ` / ${period}` : ''}`;
}

function formatDate(dateString?: string) {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getRemoteLabel(options: string) {
  const labels: Record<string, string> = {
    FULLY_REMOTE: 'Fully Remote',
    HYBRID: 'Hybrid',
    ONSITE: 'On-site',
  };
  return labels[options] || options;
}

function BenefitItem({ enabled, label }: { enabled: boolean; label: string }) {
  if (!enabled) return null;
  return (
    <li className="flex items-center gap-2 text-sm">
      <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
      <span>{label}</span>
    </li>
  );
}

interface SectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

function Section({ title, icon, children }: SectionProps) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        {icon}
        {title}
      </h2>
      {children}
    </div>
  );
}

function JobSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Skeleton variant="text" width="60%" height={36} />
        <div className="flex gap-4">
          <Skeleton variant="text" width={120} height={20} />
          <Skeleton variant="text" width={120} height={20} />
          <Skeleton variant="text" width={120} height={20} />
        </div>
      </div>
      <Skeleton variant="rectangular" height={200} />
      <div className="space-y-2">
        <Skeleton variant="text" width="100%" height={16} />
        <Skeleton variant="text" width="100%" height={16} />
        <Skeleton variant="text" width="80%" height={16} />
      </div>
    </div>
  );
}

export default function JobDetailPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug } = use(params);
  const t = useTranslations('JobDetail');
  const tJobs = useTranslations('Jobs');
  const router = useRouter();
  const { user } = useAuth();
  const { job, isLoading, isError, error } = useJob(slug);
  const { jobs: relatedJobs, isLoading: isRelatedLoading } = useRelatedJobs(job?.id || '');
  const toggleSaveJob = useToggleSaveJob();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <JobSkeleton />
        </div>
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <EmptyStateError
          error={error?.message || 'Job not found'}
          onRetry={() => router.refresh()}
        />
      </div>
    );
  }

  const handleToggleSave = () => {
    toggleSaveJob.mutate({
      jobId: job.id,
      slug: job.slug,
      isSaved: job.isSaved || false,
    });
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = `${job.title} at ${job.employer.companyName}`;

    const shareUrls: Record<string, string> = {
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      copy: '',
    };

    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      return;
    }

    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
  };

  const handleApply = () => {
    if (!user) {
      router.push(`/login?redirect=/jobs/${job.slug}/apply`);
    } else {
      router.push(`/jobs/${job.slug}/apply`);
    }
  };

  const benefits = [
    { key: 'healthInsurance', label: 'Health Insurance' },
    { key: 'dentalInsurance', label: 'Dental Insurance' },
    { key: 'visionInsurance', label: 'Vision Insurance' },
    { key: 'retirementPlan', label: '401(k) / Retirement Plan' },
    { key: 'stockOptions', label: 'Stock Options' },
    { key: 'paidTimeOff', label: 'Paid Time Off' },
    { key: 'parentalLeave', label: 'Parental Leave' },
    { key: 'tuitionReimbursement', label: 'Tuition Reimbursement' },
    { key: 'professionalDevelopment', label: 'Professional Development' },
    { key: 'remoteWork', label: 'Remote Work' },
    { key: 'flexibleHours', label: 'Flexible Hours' },
    { key: 'lifeInsurance', label: 'Life Insurance' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 py-8">
        <div className="container mx-auto px-4">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('backToJobs')}
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {job.featured && <Badge variant="success">{t('featured')}</Badge>}
                <Badge variant="info">{getRemoteLabel(job.location.remoteOptions)}</Badge>
                <Badge variant="outline">{job.jobType.replace('_', ' ')}</Badge>
              </div>

              <h1 className="text-3xl font-bold mb-2">{job.title}</h1>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                    {job.employer.logoUrl ? (
                      <img
                        src={job.employer.logoUrl}
                        alt={job.employer.companyName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{job.employer.companyName}</p>
                    {job.employer.verified && (
                      <Badge variant="success" size="sm">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {t('verified')}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
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
                  {job.experienceLevel.replace('_', ' ')}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {t('postedOn', { date: formatDate(job.publishedAt || job.createdAt) })}
                </span>
              </div>
            </div>

            {job.matchScore && (
              <div className="flex-shrink-0 lg:w-48">
                <Card className="p-4 text-center">
                  <div className="relative w-20 h-20 mx-auto mb-2">
                    <svg className="w-20 h-20 transform -rotate-90">
                      <circle
                        cx="40"
                        cy="40"
                        r="36"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        className="text-muted"
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r="36"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray={`${job.matchScore * 2.26} 226`}
                        className={
                          job.matchScore >= 80
                            ? 'text-green-500'
                            : job.matchScore >= 50
                              ? 'text-yellow-500'
                              : 'text-gray-400'
                        }
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-lg font-bold">
                      {job.matchScore}%
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{t('matchScore')}</p>
                </Card>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            <Button
              onClick={handleApply}
              size="lg"
              disabled={job.hasApplied || job.status !== 'ACTIVE'}
            >
              {job.hasApplied ? t('alreadyApplied') : t('applyNow')}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleToggleSave}
              disabled={toggleSaveJob.isPending}
            >
              {job.isSaved ? (
                <>
                  <BookmarkCheck className="h-4 w-4 mr-2" />
                  {t('saved')}
                </>
              ) : (
                <>
                  <Bookmark className="h-4 w-4 mr-2" />
                  {t('saveJob')}
                </>
              )}
            </Button>
            <div className="relative group">
              <Button variant="outline" size="lg">
                <Share2 className="h-4 w-4" />
              </Button>
              <div className="absolute top-full mt-2 left-0 bg-card border rounded-lg shadow-lg p-2 hidden group-hover:block z-10 min-w-[140px]">
                <button
                  onClick={() => handleShare('linkedin')}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent rounded-md"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  LinkedIn
                </button>
                <button
                  onClick={() => handleShare('twitter')}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent rounded-md"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  Twitter
                </button>
                <button
                  onClick={() => handleShare('copy')}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent rounded-md"
                >
                  Copy Link
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-8">
            <Card>
              <CardContent className="p-6">
                <Section
                  title={t('jobDescription')}
                  icon={<Briefcase className="h-5 w-5 text-primary" />}
                >
                  <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                    {job.description}
                  </div>
                </Section>

                {job.requirements.length > 0 && (
                  <Section
                    title={t('requirements')}
                    icon={<CheckCircle2 className="h-5 w-5 text-primary" />}
                  >
                    <ul className="list-disc pl-5 space-y-2">
                      {job.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </Section>
                )}

                {job.responsibilities.length > 0 && (
                  <Section
                    title={t('responsibilities')}
                    icon={<CheckCircle2 className="h-5 w-5 text-primary" />}
                  >
                    <ul className="list-disc pl-5 space-y-2">
                      {job.responsibilities.map((resp, index) => (
                        <li key={index}>{resp}</li>
                      ))}
                    </ul>
                  </Section>
                )}

                {job.niceToHave.length > 0 && (
                  <Section
                    title={t('niceToHave')}
                    icon={<CheckCircle2 className="h-5 w-5 text-primary" />}
                  >
                    <ul className="list-disc pl-5 space-y-2">
                      {job.niceToHave.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </Section>
                )}

                {job.skills.length > 0 && (
                  <Section
                    title={t('requiredSkills')}
                    icon={<CheckCircle2 className="h-5 w-5 text-primary" />}
                  >
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </Section>
                )}
              </CardContent>
            </Card>

            {job.benefits && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    {t('benefits')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                    {benefits.map(({ key, label }) => (
                      <BenefitItem
                        key={key}
                        enabled={job.benefits[key as keyof typeof job.benefits] as boolean}
                        label={label}
                      />
                    ))}
                    {job.benefits.other?.map((item, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  {t('location')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {job.location.isRemote ? (
                  <p className="text-muted-foreground">
                    {t('remotePosition', { options: getRemoteLabel(job.location.remoteOptions) })}
                    {job.location.travelRequirements && (
                      <span className="block mt-2">{job.location.travelRequirements}</span>
                    )}
                  </p>
                ) : (
                  <div>
                    {job.location.address && <p>{job.location.address}</p>}
                    {job.location.city && <p>{job.location.city}</p>}
                    {job.location.country && <p>{job.location.country}</p>}
                  </div>
                )}
                <div className="mt-4 h-48 bg-muted rounded-lg flex items-center justify-center">
                  <MapPin className="h-8 w-8 text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Map placeholder</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:w-80 flex-shrink-0 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {t('aboutCompany')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-semibold">{job.employer.companyName}</p>
                  <p className="text-sm text-muted-foreground">{job.employer.industry}</p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{job.employer.companySize} employees</span>
                  </div>
                  {job.employer.headquarters?.city && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {job.employer.headquarters.city}, {job.employer.headquarters.country}
                      </span>
                    </div>
                  )}
                  {job.employer.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={job.employer.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        {job.employer.website.replace(/^https?:\/\//, '')}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </div>

                {job.employer.description && (
                  <p className="text-sm text-muted-foreground line-clamp-4">
                    {job.employer.description}
                  </p>
                )}

                <div className="pt-4 border-t space-y-2">
                  <p className="text-sm font-medium">{t('jobDetails')}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">{t('openings')}</p>
                      <p className="font-medium">{job.openings}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t('views')}</p>
                      <p className="font-medium">{job.views}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t('applications')}</p>
                      <p className="font-medium">{job.applicationsCount}</p>
                    </div>
                    {job.applicationDeadline && (
                      <div>
                        <p className="text-muted-foreground">{t('deadline')}</p>
                        <p className="font-medium">{formatDate(job.applicationDeadline)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">{t('quickApply')}</h3>
                <p className="text-sm text-muted-foreground mb-4">{t('quickApplyDescription')}</p>
                <Button
                  onClick={handleApply}
                  className="w-full"
                  disabled={job.hasApplied || job.status !== 'ACTIVE'}
                >
                  {job.hasApplied ? t('alreadyApplied') : t('applyNow')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {relatedJobs.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">{t('relatedJobs')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedJobs.slice(0, 3).map((relatedJob) => (
                <Link key={relatedJob.id} href={`/jobs/${relatedJob.slug}`}>
                  <Card className="hover:shadow-lg transition-shadow h-full">
                    <CardContent className="p-4">
                      <h3 className="font-semibold line-clamp-1">{relatedJob.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {relatedJob.employer.companyName}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                        {relatedJob.location.city && <span>{relatedJob.location.city}</span>}
                        {relatedJob.salary && <span>{formatSalary(relatedJob.salary)}</span>}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
