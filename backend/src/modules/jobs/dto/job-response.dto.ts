import { z } from 'zod';

export const JobResponseSchema = z.object({
  id: z.string().uuid(),
  employerId: z.string().uuid(),
  title: z.string(),
  slug: z.string(),
  description: z.string(),
  shortDescription: z.string(),
  requirements: z.array(z.string()),
  responsibilities: z.array(z.string()),
  niceToHave: z.array(z.string()),
  skills: z.array(z.string()),
  jobType: z.string(),
  experienceLevel: z.string(),
  location: z.object({
    type: z.literal('Point'),
    coordinates: z.tuple([z.number(), z.number()]),
  }),
  locationDetails: z.record(z.unknown()).nullable(),
  salary: z
    .object({
      min: z.number().nullable(),
      max: z.number().nullable(),
      currency: z.string(),
      period: z.string(),
      negotiable: z.boolean(),
      competitive: z.boolean(),
    })
    .nullable(),
  benefits: z.record(z.boolean()).nullable(),
  applicationQuestions: z.array(z.unknown()).default([]),
  applicationDeadline: z.date().nullable(),
  startDate: z.date().nullable(),
  openings: z.number().int().positive(),
  status: z.string(),
  featured: z.boolean(),
  views: z.number().int().nonnegative(),
  applicationsCount: z.number().int().nonnegative(),
  createdAt: z.date(),
  updatedAt: z.date(),
  publishedAt: z.date().nullable(),
  expiresAt: z.date().nullable(),
  closedAt: z.date().nullable(),
  aiGeneratedDescription: z.boolean(),
  screeningCriteria: z.array(z.unknown()).default([]),
  matchSettings: z.record(z.unknown()).nullable(),
  employer: z
    .object({
      id: z.string(),
      firstName: z.string(),
      lastName: z.string(),
      email: z.string(),
      avatarUrl: z.string().nullable(),
      profile: z.record(z.unknown()).nullable(),
    })
    .nullable(),
});

export type JobResponse = z.infer<typeof JobResponseSchema>;

export interface JobResponseInput {
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
  applicationQuestions: unknown[];
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
  screeningCriteria: unknown[];
  matchSettings: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  employer: JobResponse['employer'];
}

export function toJobResponse(job: JobResponseInput): JobResponse {
  const salary =
    job.salaryMin != null || job.salaryMax != null
      ? {
          min: job.salaryMin,
          max: job.salaryMax,
          currency: job.salaryCurrency || 'USD',
          period: job.salaryPeriod || 'YEARLY',
          negotiable: job.salaryNegotiable || false,
          competitive: job.salaryCompetitive || true,
        }
      : null;

  return {
    id: job.id,
    employerId: job.employerId,
    title: job.title,
    slug: job.slug,
    description: job.description,
    shortDescription: job.shortDescription,
    requirements: job.requirements || [],
    responsibilities: job.responsibilities || [],
    niceToHave: job.niceToHave || [],
    skills: job.skills || [],
    jobType: job.jobType,
    experienceLevel: job.experienceLevel,
    location: job.location as { type: 'Point'; coordinates: [number, number] },
    locationDetails: job.locationDetails,
    salary,
    benefits: job.benefits as Record<string, boolean>,
    applicationQuestions: job.applicationQuestions || [],
    applicationDeadline: job.applicationDeadline,
    startDate: job.startDate,
    openings: job.openings || 1,
    status: job.status,
    featured: job.featured || false,
    views: job.views || 0,
    applicationsCount: job.applicationsCount || 0,
    createdAt: job.createdAt instanceof Date ? job.createdAt : new Date(job.createdAt),
    updatedAt: job.updatedAt instanceof Date ? job.updatedAt : new Date(job.updatedAt),
    publishedAt: job.publishedAt instanceof Date ? job.publishedAt : (job.publishedAt ? new Date(job.publishedAt as unknown as string) : null),
    expiresAt: job.expiresAt instanceof Date ? job.expiresAt : (job.expiresAt ? new Date(job.expiresAt as unknown as string) : null),
    closedAt: job.closedAt instanceof Date ? job.closedAt : (job.closedAt ? new Date(job.closedAt as unknown as string) : null),
    aiGeneratedDescription: job.aiGeneratedDescription || false,
    screeningCriteria: job.screeningCriteria || [],
    matchSettings: job.matchSettings,
    employer: job.employer,
  };
}
