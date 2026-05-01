import { z } from 'zod';

export const ApplicationResponseSchema = z.object({
  id: z.string().uuid(),
  jobId: z.string().uuid(),
  applicantId: z.string().uuid(),
  employerId: z.string().uuid(),
  status: z.enum([
    'SUBMITTED',
    'UNDER_REVIEW',
    'SHORTLISTED',
    'INTERVIEW_SCHEDULED',
    'INTERVIEW_COMPLETED',
    'OFFER_EXTENDED',
    'OFFER_ACCEPTED',
    'OFFER_DECLINED',
    'REJECTED',
    'WITHDRAWN',
    'EXPIRED',
  ]),
  answers: z.array(z.object({
    questionId: z.string(),
    value: z.union([z.string(), z.array(z.string())]),
  })).default([]),
  resumeUrl: z.string().url().nullable(),
  coverLetterUrl: z.string().url().nullable(),
  portfolioUrls: z.array(z.string().url()).default([]),
  matchScore: z.number().min(0).max(100).nullable(),
  aiAnalysis: z.object({
    strengths: z.array(z.string()).default([]),
    weaknesses: z.array(z.string()).default([]),
    summary: z.string(),
    recommendation: z.enum(['STRONG_APPLY', 'APPLY', 'NEUTRAL', 'SKIP']),
  }).nullable(),
  interviews: z.array(z.object({
    id: z.string().uuid(),
    scheduledAt: z.coerce.date(),
    duration: z.number().positive(),
    type: z.enum(['VIDEO', 'PHONE', 'ONSITE', 'TECHNICAL', 'ASSESSMENT']),
    meetingLink: z.string().url().optional(),
    location: z.string().optional(),
    interviewerId: z.string().uuid(),
    interviewerName: z.string(),
    interviewerEmail: z.string().email(),
    notes: z.string().max(2000).optional(),
    feedback: z.object({
      rating: z.number().min(1).max(5),
      strengths: z.array(z.string()).default([]),
      weaknesses: z.array(z.string()).default([]),
      recommendation: z.enum(['STRONG_HIRE', 'HIRE', 'NO_HIRE', 'STRONG_NO_HIRE']),
      notes: z.string().max(2000),
    }).optional(),
    status: z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED']).default('SCHEDULED'),
  })).default([]),
  notes: z.string().max(2000).nullable(),
  employerNotes: z.array(z.object({
    id: z.string().uuid(),
    authorId: z.string().uuid(),
    authorName: z.string(),
    content: z.string().max(1000),
    createdAt: z.coerce.date(),
  })).default([]),
  rejectionReason: z.string().max(500).nullable(),
  offeredSalary: z.object({
    amount: z.number().positive(),
    currency: z.string(),
    period: z.enum(['HOURLY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'YEARLY']),
  }).nullable(),
  source: z.object({
    type: z.enum(['DIRECT', 'REFERRAL', 'LINKEDIN', 'INDEED', 'OTHER_JOB_BOARD', 'SOCIAL_MEDIA', 'EMAIL']),
    referralId: z.string().uuid().optional(),
    utmData: z.object({
      source: z.string().optional(),
      medium: z.string().optional(),
      campaign: z.string().optional(),
    }).optional(),
  }).nullable(),
  submittedAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  lastActivityAt: z.coerce.date(),
  expiresAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  job: z.object({
    id: z.string().uuid(),
    title: z.string(),
    slug: z.string(),
    status: z.string(),
    employer: z.object({
      id: z.string(),
      firstName: z.string(),
      lastName: z.string(),
      email: z.string(),
      avatarUrl: z.string().nullable(),
    }).nullable(),
  }).nullable(),
  applicant: z.object({
    id: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
    avatarUrl: z.string().nullable(),
  }).nullable(),
});

export type ApplicationResponse = z.infer<typeof ApplicationResponseSchema>;

export interface ApplicationResponseInput {
  id: string;
  jobId: string;
  applicantId: string;
  employerId: string;
  status: string;
  answers: Array<{ questionId: string; value: string | string[] }>;
  resumeUrl: string | null;
  coverLetterUrl: string | null;
  portfolioUrls: string[];
  matchScore: number | null;
  aiAnalysis: {
    strengths: string[];
    weaknesses: string[];
    summary: string;
    recommendation: string;
  } | null;
  interviews: Array<{
    id: string;
    scheduledAt: Date;
    duration: number;
    type: string;
    meetingLink?: string;
    location?: string;
    interviewerId: string;
    interviewerName: string;
    interviewerEmail: string;
    notes?: string;
    feedback?: {
      rating: number;
      strengths: string[];
      weaknesses: string[];
      recommendation: string;
      notes: string;
    };
    status: string;
  }>;
  notes: string | null;
  employerNotes: Array<{
    id: string;
    authorId: string;
    authorName: string;
    content: string;
    createdAt: Date;
  }>;
  rejectionReason: string | null;
  offeredSalaryAmount: number | null;
  offeredSalaryCurrency: string | null;
  offeredSalaryPeriod: string | null;
  sourceType: string;
  sourceReferralId: string | null;
  sourceUtmSource: string | null;
  sourceUtmMedium: string | null;
  sourceUtmCampaign: string | null;
  submittedAt: Date;
  updatedAt: Date;
  lastActivityAt: Date;
  expiresAt: Date | null;
  createdAt: Date;
  job?: {
    id: string;
    title: string;
    slug: string;
    status: string;
    employer?: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      avatarUrl: string | null;
    } | null;
  } | null;
  applicant?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl: string | null;
  } | null;
}

export function toApplicationResponse(application: ApplicationResponseInput): ApplicationResponse {
  const safeDate = (date: Date | string): Date => {
    if (date instanceof Date) return date;
    return new Date(date);
  };

  const sourceVal = application.sourceType
    ? {
        type: application.sourceType as 'DIRECT' | 'REFERRAL' | 'LINKEDIN' | 'INDEED' | 'OTHER_JOB_BOARD' | 'SOCIAL_MEDIA' | 'EMAIL',
        referralId: application.sourceReferralId ?? undefined,
        utmData: (application.sourceUtmSource || application.sourceUtmMedium || application.sourceUtmCampaign)
          ? {
              source: application.sourceUtmSource ?? undefined,
              medium: application.sourceUtmMedium ?? undefined,
              campaign: application.sourceUtmCampaign ?? undefined,
            }
          : undefined,
      }
    : null;

  const offeredSalaryVal = application.offeredSalaryAmount
    ? {
        amount: Number(application.offeredSalaryAmount),
        currency: application.offeredSalaryCurrency ?? 'USD',
        period: (application.offeredSalaryPeriod ?? 'YEARLY') as 'HOURLY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'YEARLY',
      }
    : null;

  const jobVal = application.job
    ? {
        id: application.job.id,
        title: application.job.title,
        slug: application.job.slug,
        status: application.job.status,
        employer: application.job.employer
          ? {
              id: application.job.employer.id,
              firstName: application.job.employer.firstName,
              lastName: application.job.employer.lastName,
              email: application.job.employer.email,
              avatarUrl: application.job.employer.avatarUrl,
            }
          : null,
      }
    : null;

  const applicantVal = application.applicant
    ? {
        id: application.applicant.id,
        firstName: application.applicant.firstName,
        lastName: application.applicant.lastName,
        email: application.applicant.email,
        avatarUrl: application.applicant.avatarUrl,
      }
    : null;

  return {
    id: application.id,
    jobId: application.jobId,
    applicantId: application.applicantId,
    employerId: application.employerId,
    status: application.status as ApplicationResponse['status'],
    answers: application.answers || [],
    resumeUrl: application.resumeUrl,
    coverLetterUrl: application.coverLetterUrl,
    portfolioUrls: application.portfolioUrls || [],
    matchScore: application.matchScore,
    aiAnalysis: application.aiAnalysis as ApplicationResponse['aiAnalysis'],
    interviews: (application.interviews || []) as ApplicationResponse['interviews'],
    notes: application.notes,
    employerNotes: application.employerNotes || [],
    rejectionReason: application.rejectionReason,
    offeredSalary: offeredSalaryVal as ApplicationResponse['offeredSalary'],
    source: sourceVal as ApplicationResponse['source'],
    submittedAt: safeDate(application.submittedAt),
    updatedAt: safeDate(application.updatedAt),
    lastActivityAt: safeDate(application.lastActivityAt),
    expiresAt: application.expiresAt ? safeDate(application.expiresAt) : null,
    createdAt: safeDate(application.createdAt),
    job: jobVal as ApplicationResponse['job'],
    applicant: applicantVal as ApplicationResponse['applicant'],
  };
}