import { ApplicationStatus, ApplicationSearchFilters } from '@smartjob/shared';

export interface CreateApplicationInput {
  jobId: string;
  applicantId: string;
  employerId: string;
  answers?: Array<{ questionId: string; value: string | string[] }>;
  resumeUrl?: string | null;
  coverLetterUrl?: string | null;
  portfolioUrls?: string[];
  source?: {
    type: string;
    referralId?: string;
    utmData?: {
      source?: string;
      medium?: string;
      campaign?: string;
    };
  };
}

export interface UpdateApplicationInput {
  status?: ApplicationStatus;
  answers?: Array<{ questionId: string; value: string | string[] }>;
  resumeUrl?: string | null;
  coverLetterUrl?: string | null;
  portfolioUrls?: string[];
  matchScore?: number | null;
  aiAnalysis?: {
    strengths: string[];
    weaknesses: string[];
    summary: string;
    recommendation: string;
  } | null;
  interviews?: unknown[];
  notes?: string | null;
  employerNotes?: unknown[];
  rejectionReason?: string | null;
  offeredSalary?: {
    amount: number;
    currency: string;
    period: string;
  } | null;
  lastActivityAt?: Date;
  expiresAt?: Date | null;
}

export interface ApplicationFilterInput {
  jobId?: string;
  applicantId?: string;
  employerId?: string;
  status?: ApplicationStatus | ApplicationStatus[];
}

export interface IApplicationRepository {
  create(data: CreateApplicationInput): Promise<Record<string, unknown>>;
  findById(id: string): Promise<Record<string, unknown> | null>;
  findAll(
    filter: ApplicationFilterInput,
    pagination: { page: number; limit: number }
  ): Promise<{
    data: Record<string, unknown>[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
  search(
    filters: ApplicationSearchFilters
  ): Promise<{
    data: Record<string, unknown>[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
  update(id: string, data: UpdateApplicationInput): Promise<Record<string, unknown>>;
  delete(id: string): Promise<void>;
  updateStatus(id: string, status: ApplicationStatus): Promise<Record<string, unknown>>;
  addInterview(
    id: string,
    interview: unknown
  ): Promise<Record<string, unknown>>;
  submitFeedback(
    id: string,
    interviewId: string,
    feedback: unknown
  ): Promise<Record<string, unknown>>;
  existsByJobAndApplicant(jobId: string, applicantId: string): Promise<boolean>;
  findByJob(jobId: string, pagination: { page: number; limit: number }): Promise<{
    data: Record<string, unknown>[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
  findByApplicant(applicantId: string, pagination: { page: number; limit: number }): Promise<{
    data: Record<string, unknown>[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
}