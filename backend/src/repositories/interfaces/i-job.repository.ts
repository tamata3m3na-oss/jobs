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

export interface JobEmployer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
  profile: Record<string, unknown> | null;
}

export interface JobWithEmployerResult {
  id: string;
  employerId: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  requirements: string[];
  responsibilities: string[];
  niceToHave: string[];
  skills: string[];
  jobType: string;
  experienceLevel: string;
  location: { type: 'Point'; coordinates: [number, number] };
  locationDetails: Record<string, unknown> | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  salaryPeriod: string;
  salaryNegotiable: boolean;
  salaryCompetitive: boolean;
  benefits: Record<string, unknown>;
  applicationQuestions: Record<string, unknown>[];
  applicationDeadline: Date | null;
  startDate: Date | null;
  openings: number;
  status: string;
  featured: boolean;
  views: number;
  applicationsCount: number;
  publishedAt: Date | null;
  expiresAt: Date | null;
  closedAt: Date | null;
  aiGeneratedDescription: boolean;
  screeningCriteria: Record<string, unknown>[];
  matchSettings: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  employer: JobEmployer | null;
}

export interface JobListResult {
  data: JobWithEmployerResult[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface JobStats {
  jobId: string;
  views: number;
  applicationsCount: number;
}

export interface IJobRepository {
  create(data: CreateJobInput): Promise<JobWithEmployerResult>;
  findById(id: string): Promise<JobWithEmployerResult | null>;
  findByIdWithEmployer(id: string): Promise<JobWithEmployerResult | null>;
  findBySlug(slug: string): Promise<JobWithEmployerResult | null>;
  findBySlugWithEmployer(slug: string): Promise<JobWithEmployerResult | null>;
  findAll(filter: JobFilterInput, pagination: { page: number; limit: number; sortBy?: string; sortOrder?: string }): Promise<JobListResult>;
  search(filters: JobSearchFilters): Promise<JobListResult>;
  paginate(page: number, limit: number, filters?: JobFilterInput): Promise<JobListResult>;
  update(id: string, data: UpdateJobInput): Promise<JobWithEmployerResult>;
  updateStatus(id: string, status: JobStatus): Promise<JobWithEmployerResult>;
  delete(id: string): Promise<void>;
  incrementViews(id: string): Promise<void>;
  incrementApplications(id: string): Promise<void>;
  countApplications(id: string): Promise<number>;
  updateApplicationsCount(id: string, count: number): Promise<void>;
  existsBySlug(slug: string): Promise<boolean>;
  findByEmployer(employerId: string, pagination: { page: number; limit: number; sortBy?: string; sortOrder?: string }): Promise<JobListResult>;
  findFeaturedJobs(limit?: number): Promise<JobWithEmployerResult[]>;
  getJobStats(jobId: string): Promise<JobStats>;
}
