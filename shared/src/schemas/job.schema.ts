import { z } from 'zod';
import { LocationSchema } from './user.schema';

export const JobType = z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'TEMPORARY', 'VOLUNTEER']);
export type JobType = z.infer<typeof JobType>;

export const JobStatus = z.enum(['DRAFT', 'PENDING_APPROVAL', 'ACTIVE', 'PAUSED', 'EXPIRED', 'CLOSED', 'REJECTED']);
export type JobStatus = z.infer<typeof JobStatus>;

export const ExperienceLevel = z.enum(['ENTRY', 'JUNIOR', 'MID', 'SENIOR', 'LEAD', 'EXECUTIVE']);
export type ExperienceLevel = z.infer<typeof ExperienceLevel>;

export const SalarySchema = z.object({
  min: z.number().positive(),
  max: z.number().positive(),
  currency: z.string().default('USD'),
  period: z.enum(['HOURLY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'YEARLY']).default('YEARLY'),
  negotiable: z.boolean().default(false),
  competitive: z.boolean().default(true),
});

export type Salary = z.infer<typeof SalarySchema>;

export const BenefitsSchema = z.object({
  healthInsurance: z.boolean().default(false),
  dentalInsurance: z.boolean().default(false),
  visionInsurance: z.boolean().default(false),
  retirementPlan: z.boolean().default(false),
  stockOptions: z.boolean().default(false),
  paidTimeOff: z.boolean().default(false),
  parentalLeave: z.boolean().default(false),
  tuitionReimbursement: z.boolean().default(false),
  professionalDevelopment: z.boolean().default(false),
  remoteWork: z.boolean().default(false),
  flexibleHours: z.boolean().default(false),
  lifeInsurance: z.boolean().default(false),
  other: z.array(z.string()).default([]),
});

export type Benefits = z.infer<typeof BenefitsSchema>;

export const JobLocationSchema = z.object({
  type: z.literal('Point').default('Point'),
  coordinates: z.tuple([z.number(), z.number()]),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  isRemote: z.boolean().default(false),
  remoteOptions: z.enum(['FULLY_REMOTE', 'HYBRID', 'ONSITE']).default('ONSITE'),
  travelRequirements: z.string().optional(),
});

export type JobLocation = z.infer<typeof JobLocationSchema>;

export const JobApplicationQuestionSchema = z.object({
  id: z.string().uuid(),
  question: z.string().min(1).max(500),
  type: z.enum(['TEXT', 'TEXTAREA', 'SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'DROPDOWN', 'DATE', 'NUMBER', 'FILE']),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(),
  maxLength: z.number().positive().optional(),
  minLength: z.number().positive().optional(),
  maxFileSize: z.number().positive().optional(),
  allowedFileTypes: z.array(z.string()).optional(),
});

export type JobApplicationQuestion = z.infer<typeof JobApplicationQuestionSchema>;

export const JobSchema = z.object({
  id: z.string().uuid(),
  employerId: z.string().uuid(),
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(250),
  description: z.string().min(1).max(10000),
  shortDescription: z.string().min(1).max(500),
  requirements: z.array(z.string()).default([]),
  responsibilities: z.array(z.string()).default([]),
  niceToHave: z.array(z.string()).default([]),
  skills: z.array(z.string()).default([]),
  jobType: JobType,
  experienceLevel: ExperienceLevel.default('MID'),
  location: JobLocationSchema,
  salary: SalarySchema.optional(),
  benefits: BenefitsSchema.default({}),
  applicationQuestions: z.array(JobApplicationQuestionSchema).default([]),
  applicationDeadline: z.coerce.date().optional(),
  startDate: z.coerce.date().optional(),
  openings: z.number().positive().default(1),
  status: JobStatus.default('DRAFT'),
  featured: z.boolean().default(false),
  views: z.number().nonnegative().default(0),
  applicationsCount: z.number().nonnegative().default(0),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  publishedAt: z.coerce.date().optional(),
  expiresAt: z.coerce.date().optional(),
  closedAt: z.coerce.date().optional(),
  aiGeneratedDescription: z.boolean().default(false),
  screeningCriteria: z
    .array(
      z.object({
        id: z.string().uuid(),
        name: z.string(),
        weight: z.number().min(0).max(1),
        type: z.enum(['SKILL', 'EXPERIENCE', 'EDUCATION', 'CERTIFICATION', 'LANGUAGE', 'CUSTOM']),
      })
    )
    .default([]),
  matchSettings: z
    .object({
      enableAiMatching: z.boolean().default(true),
      minMatchScore: z.number().min(0).max(100).default(60),
      autoSuggestCandidates: z.boolean().default(false),
      blindHiring: z.boolean().default(false),
    })
    .default({}),
  });

  export type Job = z.infer<typeof JobSchema>;

export const JobSearchFiltersSchema = z.object({
  query: z.string().optional(),
  location: LocationSchema.optional(),
  radius: z.number().positive().default(50),
  jobTypes: z.array(JobType).default([]),
  experienceLevels: z.array(ExperienceLevel).default([]),
  salaryMin: z.number().positive().optional(),
  salaryMax: z.number().positive().optional(),
  skills: z.array(z.string()).default([]),
  benefits: z
    .array(
      z.enum([
        'healthInsurance',
        'dentalInsurance',
        'visionInsurance',
        'retirementPlan',
        'stockOptions',
        'paidTimeOff',
        'parentalLeave',
        'tuitionReimbursement',
        'professionalDevelopment',
        'remoteWork',
        'flexibleHours',
        'lifeInsurance',
      ])
    )
    .default([]),
  remoteOptions: z.array(z.enum(['FULLY_REMOTE', 'HYBRID', 'ONSITE'])).default([]),
  postedWithin: z.enum(['24_HOURS', '7_DAYS', '30_DAYS', '90_DAYS', 'ANY']).default('ANY'),
  status: JobStatus.default('ACTIVE'),
  employerId: z.string().uuid().optional(),
  industry: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sortBy: z
    .enum(['relevance', 'date', 'salary', 'distance'])
    .default('relevance'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type JobSearchFilters = z.infer<typeof JobSearchFiltersSchema>;

export const CreateJobSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(10000),
  shortDescription: z.string().min(1).max(500),
  requirements: z.array(z.string()).default([]),
  responsibilities: z.array(z.string()).default([]),
  niceToHave: z.array(z.string()).default([]),
  skills: z.array(z.string()).default([]),
  jobType: JobType,
  experienceLevel: ExperienceLevel.default('MID'),
  location: JobLocationSchema,
  salary: SalarySchema.optional(),
  benefits: BenefitsSchema.default({}),
  applicationQuestions: z.array(JobApplicationQuestionSchema.omit({ id: true })).default([]),
  applicationDeadline: z.coerce.date().optional(),
  startDate: z.coerce.date().optional(),
  openings: z.number().positive().default(1),
  status: JobStatus.default('DRAFT'),
  featured: z.boolean().default(false),
  screeningCriteria: z
    .array(
      z.object({
        name: z.string(),
        weight: z.number().min(0).max(1),
        type: z.enum(['SKILL', 'EXPERIENCE', 'EDUCATION', 'CERTIFICATION', 'LANGUAGE', 'CUSTOM']),
      })
    )
    .default([]),
  matchSettings: z
    .object({
      enableAiMatching: z.boolean().default(true),
      minMatchScore: z.number().min(0).max(100).default(60),
      autoSuggestCandidates: z.boolean().default(false),
      blindHiring: z.boolean().default(false),
    })
    .default({}),
  });

  export const UpdateJobSchema = CreateJobSchema.partial().strict();

export type CreateJob = z.infer<typeof CreateJobSchema>;
export type UpdateJob = z.infer<typeof UpdateJobSchema>;
