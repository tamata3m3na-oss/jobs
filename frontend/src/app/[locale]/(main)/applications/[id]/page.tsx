'use client';

import { use, useState } from 'react';
import { Link, useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';
import {
  useApplication,
  useWithdrawApplication,
  getStatusLabel,
  getStatusVariant,
  ApplicationDetail,
} from '@/hooks/useApplications';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyStateError } from '@/components/ui/EmptyState';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalBody } from '@/components/ui/Modal';
import {
  ArrowLeft,
  Briefcase,
  Building2,
  MapPin,
  Clock,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  Download,
  Trash2,
} from 'lucide-react';

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function TimelineItem({ timeline }: { timeline: ApplicationDetail['timeline'][0] }) {
  const t = useTranslations('Applications');

  const getIcon = (status: string) => {
    if (status === 'OFFER_ACCEPTED' || status === 'SHORTLISTED') {
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    }
    if (status === 'REJECTED' || status === 'WITHDRAWN') {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
    return <div className="w-5 h-5 rounded-full bg-blue-500" />;
  };

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
          {getIcon(timeline.status)}
        </div>
        <div className="w-0.5 h-full bg-muted my-2" />
      </div>
      <div className="flex-1 pb-6">
        <div className="flex items-start justify-between">
          <div>
            <Badge variant={getStatusVariant(timeline.status as ApplicationDetail['status'])}>
              {getStatusLabel(timeline.status as ApplicationDetail['status'])}
            </Badge>
            <h4 className="font-medium mt-1">{timeline.title}</h4>
            {timeline.description && (
              <p className="text-sm text-muted-foreground mt-1">{timeline.description}</p>
            )}
            {timeline.notes && (
              <p className="text-sm mt-2 p-3 bg-muted rounded-md">{timeline.notes}</p>
            )}
          </div>
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {formatDateTime(timeline.timestamp)}
          </span>
        </div>
      </div>
    </div>
  );
}

function ApplicationSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Skeleton variant="text" width="60%" height={36} />
        <div className="flex gap-4">
          <Skeleton variant="text" width={80} height={24} />
          <Skeleton variant="text" width={60} height={24} />
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

export default function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useTranslations('Applications');
  const tJobDetail = useTranslations('JobDetail');
  const router = useRouter();
  const { user } = useAuth();
  const { application, isLoading, isError, error } = useApplication(id);
  const withdrawMutation = useWithdrawApplication();
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <ApplicationSkeleton />
        </div>
      </div>
    );
  }

  if (isError || !application) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <EmptyStateError
          error={error?.message || 'Application not found'}
          onRetry={() => router.refresh()}
        />
      </div>
    );
  }

  const handleWithdraw = async () => {
    try {
      await withdrawMutation.mutateAsync(application.id);
      setShowWithdrawModal(false);
      router.refresh();
    } catch (err) {
      console.error('Failed to withdraw application:', err);
    }
  };

  const canWithdraw = !['REJECTED', 'WITHDRAWN', 'OFFER_ACCEPTED', 'OFFER_DECLINED'].includes(
    application.status
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 py-8">
        <div className="container mx-auto px-4">
          <Link
            href="/applications"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
          >
            <span className="inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              {t('backToApplications')}
            </span>
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant={getStatusVariant(application.status)} size="lg">
                  {getStatusLabel(application.status)}
                </Badge>
              </div>

              <h1 className="text-3xl font-bold mb-2">{application.jobTitle}</h1>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
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
                  <span className="font-medium">{application.employerName}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Applied on {formatDate(application.appliedAt)}
                </span>
                {application.matchScore && (
                  <span className="flex items-center gap-1">
                    Match Score: {application.matchScore}%
                  </span>
                )}
              </div>
            </div>

            {canWithdraw && (
              <Button
                variant="outline"
                className="text-destructive hover:text-destructive"
                onClick={() => setShowWithdrawModal(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t('withdraw')}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  {t('applicationTimeline')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-0">
                  {application.timeline.map((item) => (
                    <TimelineItem key={item.id} timeline={item} />
                  ))}
                </div>
              </CardContent>
            </Card>

            {application.answers && application.answers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    {t('applicationQuestions')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {application.answers.map((answer, index) => (
                    <div key={answer.questionId} className="border-b pb-4 last:border-0 last:pb-0">
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        {index + 1}. {answer.question}
                      </p>
                      <p className="text-foreground">{answer.answer}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {application.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-primary" />
                    {t('yourNotes')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{application.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:w-80 flex-shrink-0 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  {t('jobSummary')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
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
                  <div>
                    <p className="font-semibold">{application.employerName}</p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  {application.job.location?.city && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {application.job.location.city}
                        {application.job.location.country &&
                          `, ${application.job.location.country}`}
                      </span>
                    </div>
                  )}

                  {application.job.salary && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Salary:</span>
                      <span className="font-medium">
                        {application.job.salary.currency}{' '}
                        {application.job.salary.min.toLocaleString()} -{' '}
                        {application.job.salary.max.toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span>{application.job.jobType.replace('_', ' ')}</span>
                  </div>
                </div>

                <Link href={`/jobs/${application.jobSlug}`}>
                  <Button variant="outline" className="w-full">
                    {tJobDetail('viewJob')}
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {t('documents')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {application.resumeUrl && (
                  <a
                    href={application.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm font-medium">{t('resume')}</span>
                    </div>
                    <Download className="h-4 w-4 text-muted-foreground" />
                  </a>
                )}

                {application.coverLetterUrl && (
                  <a
                    href={application.coverLetterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm font-medium">{t('coverLetter')}</span>
                    </div>
                    <Download className="h-4 w-4 text-muted-foreground" />
                  </a>
                )}

                {!application.resumeUrl && !application.coverLetterUrl && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {t('noDocuments')}
                  </p>
                )}
              </CardContent>
            </Card>

            {application.employerNotes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    {t('employerNotes')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{application.employerNotes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Modal open={showWithdrawModal} onOpenChange={(open) => !open && setShowWithdrawModal(false)}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>{t('withdrawApplication')}</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <p className="text-muted-foreground">{t('withdrawConfirmation')}</p>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowWithdrawModal(false)}>
                  {t('cancel')}
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleWithdraw}
                  isLoading={withdrawMutation.isPending}
                >
                  {t('withdraw')}
                </Button>
              </div>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
}
