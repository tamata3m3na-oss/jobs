import { z } from 'zod';

export const ApplicationStatus = z.enum([
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
]);
export type ApplicationStatus = z.infer<typeof ApplicationStatus>;

export const ApplicationAnswerSchema = z.object({
  questionId: z.string().uuid(),
  answer: z.union([z.string(), z.array(z.string()), z.number(), z.instanceof(File)]),
});

export type ApplicationAnswer = z.infer<typeof ApplicationAnswerSchema>;

export const InterviewSchema = z.object({
  id: z.string().uuid(),
  scheduledAt: z.coerce.date(),
  duration: z.number().positive().default(60),
  type: z.enum(['VIDEO', 'PHONE', 'ONSITE', 'TECHNICAL', 'ASSESSMENT']),
  meetingLink: z.string().url().optional(),
  location: z.string().optional(),
  interviewerId: z.string().uuid(),
  interviewerName: z.string(),
  interviewerEmail: z.string().email(),
  notes: z.string().max(2000).optional(),
  feedback: z
    .object({
      rating: z.number().min(1).max(5),
      strengths: z.array(z.string()).default([]),
      weaknesses: z.array(z.string()).default([]),
      recommendation: z.enum(['STRONG_HIRE', 'HIRE', 'NO_HIRE', 'STRONG_NO_HIRE']),
      notes: z.string().max(2000),
    })
    .optional(),
  status: z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED']).default('SCHEDULED'),
});

export type Interview = z.infer<typeof InterviewSchema>;

export const ApplicationSchema = z.object({
  id: z.string().uuid(),
  jobId: z.string().uuid(),
  applicantId: z.string().uuid(),
  employerId: z.string().uuid(),
  status: ApplicationStatus.default('SUBMITTED'),
  answers: z
    .array(
      z.object({
        questionId: z.string().uuid(),
        value: z.union([z.string(), z.array(z.string())]),
      })
    )
    .default([]),
  resumeUrl: z.string().url().optional(),
  coverLetterUrl: z.string().url().optional(),
  portfolioUrls: z.array(z.string().url()).default([]),
  matchScore: z.number().min(0).max(100).optional(),
  aiAnalysis: z
    .object({
      strengths: z.array(z.string()).default([]),
      weaknesses: z.array(z.string()).default([]),
      summary: z.string().max(1000),
      recommendation: z.enum(['STRONG_APPLY', 'APPLY', 'NEUTRAL', 'SKIP']),
    })
    .optional(),
  interviews: z.array(InterviewSchema).default([]),
  notes: z.string().max(2000).optional(),
  employerNotes: z
    .array(
      z.object({
        id: z.string().uuid(),
        authorId: z.string().uuid(),
        authorName: z.string(),
        content: z.string().max(1000),
        createdAt: z.coerce.date(),
      })
    )
    .default([]),
  rejectionReason: z.string().max(500).optional(),
  offeredSalary: z
    .object({
      amount: z.number().positive(),
      currency: z.string().default('USD'),
      period: z.enum(['HOURLY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'YEARLY']).default('YEARLY'),
    })
    .optional(),
  source: z
    .object({
      type: z.enum([
        'DIRECT',
        'REFERRAL',
        'LINKEDIN',
        'INDEED',
        'OTHER_JOB_BOARD',
        'SOCIAL_MEDIA',
        'EMAIL',
      ]),
      referralId: z.string().uuid().optional(),
      utmData: z
        .object({
          source: z.string().optional(),
          medium: z.string().optional(),
          campaign: z.string().optional(),
        })
        .optional(),
    })
    .default({ type: 'DIRECT' }),
  submittedAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  lastActivityAt: z.coerce.date(),
  expiresAt: z.coerce.date().optional(),
  createdAt: z.coerce.date(),
});

export type Application = z.infer<typeof ApplicationSchema>;

export const ApplicationSearchFiltersSchema = z.object({
  jobId: z.string().uuid().optional(),
  applicantId: z.string().uuid().optional(),
  employerId: z.string().uuid().optional(),
  status: z.union([ApplicationStatus, z.array(ApplicationStatus)]).optional(),
  matchScoreMin: z.number().min(0).max(100).optional(),
  matchScoreMax: z.number().min(0).max(100).optional(),
  submittedAfter: z.coerce.date().optional(),
  submittedBefore: z.coerce.date().optional(),
  hasInterview: z.boolean().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sortBy: z.enum(['date', 'matchScore', 'status']).default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type ApplicationSearchFilters = z.infer<typeof ApplicationSearchFiltersSchema>;

export const CreateApplicationSchema = z.object({
  jobId: z.string().uuid(),
  answers: z
    .array(
      z.object({
        questionId: z.string().uuid(),
        value: z.union([z.string(), z.array(z.string())]),
      })
    )
    .default([]),
  coverLetter: z.string().max(2000).optional(),
  portfolioUrls: z.array(z.string().url()).default([]),
  source: z
    .object({
      type: z.enum([
        'DIRECT',
        'REFERRAL',
        'LINKEDIN',
        'INDEED',
        'OTHER_JOB_BOARD',
        'SOCIAL_MEDIA',
        'EMAIL',
      ]),
      referralId: z.string().uuid().optional(),
      utmData: z
        .object({
          source: z.string().optional(),
          medium: z.string().optional(),
          campaign: z.string().optional(),
        })
        .optional(),
    })
    .default({ type: 'DIRECT' }),
});

export const UpdateApplicationStatusSchema = z.object({
  status: ApplicationStatus,
  rejectionReason: z.string().max(500).optional(),
  notes: z.string().max(2000).optional(),
});

export const ScheduleInterviewSchema = z.object({
  applicationId: z.string().uuid(),
  scheduledAt: z.coerce.date(),
  duration: z.number().positive().default(60),
  type: z.enum(['VIDEO', 'PHONE', 'ONSITE', 'TECHNICAL', 'ASSESSMENT']),
  meetingLink: z.string().url().optional(),
  location: z.string().optional(),
  interviewerId: z.string().uuid(),
  interviewerName: z.string(),
  interviewerEmail: z.string().email(),
  notes: z.string().max(2000).optional(),
});

export const SubmitInterviewFeedbackSchema = z.object({
  applicationId: z.string().uuid(),
  interviewId: z.string().uuid(),
  rating: z.number().min(1).max(5),
  strengths: z.array(z.string()).default([]),
  weaknesses: z.array(z.string()).default([]),
  recommendation: z.enum(['STRONG_HIRE', 'HIRE', 'NO_HIRE', 'STRONG_NO_HIRE']),
  notes: z.string().max(2000),
});

export type CreateApplication = z.infer<typeof CreateApplicationSchema>;
export type UpdateApplicationStatus = z.infer<typeof UpdateApplicationStatusSchema>;
export type ScheduleInterview = z.infer<typeof ScheduleInterviewSchema>;
export type SubmitInterviewFeedback = z.infer<typeof SubmitInterviewFeedbackSchema>;
