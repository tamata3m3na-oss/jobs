import { JobStatus, JobType, ExperienceLevel, JobSearchFilters } from '@smartjob/shared';

export interface CreateJobInput {
  employerId: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  requirements?: string[];
  responsibilities?: string[];
  niceToHave?: string[];
  skills?: string[];
  jobType: JobType;
  experienceLevel?: ExperienceLevel;
  location: { type: 'Point'; coordinates: [number, number] };
  locationDetails?: Record<string, unknown>;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string | null;
  salaryPeriod?: string | null;
  salaryNegotiable?: boolean;
  salaryCompetitive?: boolean;
  benefits?: Record<string, unknown>;
  applicationQuestions?: Record<string, unknown>[];
  applicationDeadline?: Date | null;
  startDate?: Date | null;
  openings?: number;
  status?: JobStatus;
  featured?: boolean;
  screeningCriteria?: Record<string, unknown>[];
  matchSettings?: Record<string, unknown>;
}

export interface UpdateJobInput {
  title?: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  requirements?: string[];
  responsibilities?: string[];
  niceToHave?: string[];
  skills?: string[];
  jobType?: JobType;
  experienceLevel?: ExperienceLevel;
  location?: { type: 'Point'; coordinates: [number, number] };
  locationDetails?: Record<string, unknown>;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string | null;
  salaryPeriod?: string | null;
  salaryNegotiable?: boolean;
  salaryCompetitive?: boolean;
  benefits?: Record<string, unknown>;
  applicationQuestions?: Record<string, unknown>[];
  applicationDeadline?: Date | null;
  startDate?: Date | null;
  openings?: number;
  status?: JobStatus;
  featured?: boolean;
  publishedAt?: Date | null;
  expiresAt?: Date | null;
  closedAt?: Date | null;
  aiGeneratedDescription?: boolean;
  screeningCriteria?: Record<string, unknown>[];
  matchSettings?: Record<string, unknown>;
}

export interface JobFilterInput {
  employerId?: string;
  status?: JobStatus;
  jobType?: JobType;
  experienceLevel?: ExperienceLevel;
}

export interface IJobRepository {
  create(data: CreateJobInput): Promise<Record<string, unknown>>;
  findById(id: string): Promise<Record<string, unknown> | null>;
  findBySlug(slug: string): Promise<Record<string, unknown> | null>;
  findAll(filter: JobFilterInput, pagination: { page: number; limit: number }): Promise<{
    data: Record<string, unknown>[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
  search(filters: JobSearchFilters): Promise<{
    data: Record<string, unknown>[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
  update(id: string, data: UpdateJobInput): Promise<Record<string, unknown>>;
  delete(id: string): Promise<void>;
  incrementViews(id: string): Promise<void>;
  updateApplicationsCount(id: string, count: number): Promise<void>;
  existsBySlug(slug: string): Promise<boolean>;
  findByEmployer(employerId: string, pagination: { page: number; limit: number }): Promise<{
    data: Record<string, unknown>[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
}