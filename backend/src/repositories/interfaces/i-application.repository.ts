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

export interface InterviewData {
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
}

export interface EmployerNoteData {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: Date;
}

export interface ApplicationWithRelations {
  id: string;
  jobId: string;
  applicantId: string;
  employerId: string;
  status: ApplicationStatus;
  answers: Array<{ questionId: string; value: string | string[] }>;
  resumeUrl: string | null;
  coverLetterUrl: string | null;
  portfolioUrls: string[];
  matchScore: number | null;
  aiAnalysis: CreateApplicationInput['aiAnalysis'];
  interviews: InterviewData[];
  notes: string | null;
  employerNotes: EmployerNoteData[];
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

export interface ApplicationStats {
  totalApplications: number;
  statusBreakdown: Record<string, number>;
  averageMatchScore: number | null;
  newApplications: number;
  pendingReview: number;
  inInterview: number;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: 'date' | 'matchScore' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IApplicationRepository {
  create(data: CreateApplicationInput): Promise<ApplicationWithRelations>;
  findById(id: string): Promise<ApplicationWithRelations | null>;
  findByJobAndApplicant(jobId: string, applicantId: string): Promise<ApplicationWithRelations | null>;
  findByJob(jobId: string, pagination: PaginationOptions): Promise<PaginatedResult<ApplicationWithRelations>>;
  findByApplicant(applicantId: string, pagination: PaginationOptions): Promise<PaginatedResult<ApplicationWithRelations>>;
  findByEmployer(employerId: string, pagination: PaginationOptions): Promise<PaginatedResult<ApplicationWithRelations>>;
  findAll(
    filter: ApplicationFilterInput,
    pagination: PaginationOptions
  ): Promise<PaginatedResult<ApplicationWithRelations>>;
  search(
    filters: ApplicationSearchFilters
  ): Promise<PaginatedResult<ApplicationWithRelations>>;
  paginate(
    page: number,
    limit: number,
    filters?: ApplicationSearchFilters
  ): Promise<PaginatedResult<ApplicationWithRelations>>;
  update(id: string, data: UpdateApplicationInput): Promise<ApplicationWithRelations>;
  delete(id: string): Promise<void>;
  updateStatus(id: string, status: ApplicationStatus): Promise<ApplicationWithRelations>;
  addInterview(id: string, interview: InterviewData): Promise<ApplicationWithRelations>;
  addNote(id: string, note: EmployerNoteData): Promise<ApplicationWithRelations>;
  existsByJobAndApplicant(jobId: string, applicantId: string): Promise<boolean>;
  getApplicationStats(jobId: string): Promise<ApplicationStats>;
}