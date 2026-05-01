import { z } from 'zod';

export const UserRole = z.enum(['JOB_SEEKER', 'EMPLOYER', 'ADMIN']);
export type UserRole = z.infer<typeof UserRole>;

export const UserStatus = z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION']);
export type UserStatus = z.infer<typeof UserStatus>;

export const LocationSchema = z.object({
  type: z.literal('Point').default('Point'),
  coordinates: z.tuple([z.number(), z.number()]),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
});

export type Location = z.infer<typeof LocationSchema>;

export const BaseUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  role: UserRole,
  status: UserStatus.default('PENDING_VERIFICATION'),
  phone: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  verifiedAt: z.coerce.date().optional(),
});

export const JobSeekerProfileSchema = z.object({
  headline: z.string().max(200).optional(),
  summary: z.string().max(2000).optional(),
  skills: z.array(z.string()).default([]),
  experience: z
    .array(
      z.object({
        id: z.string().uuid(),
        title: z.string().min(1).max(100),
        company: z.string().min(1).max(200),
        location: LocationSchema.optional(),
        startDate: z.coerce.date(),
        endDate: z.coerce.date().optional(),
        current: z.boolean().default(false),
        description: z.string().max(2000).optional(),
      })
    )
    .default([]),
  education: z
    .array(
      z.object({
        id: z.string().uuid(),
        institution: z.string().min(1).max(200),
        degree: z.string().min(1).max(100),
        field: z.string().min(1).max(100),
        startDate: z.coerce.date(),
        endDate: z.coerce.date().optional(),
        current: z.boolean().default(false),
      })
    )
    .default([]),
  resumeUrl: z.string().url().optional(),
  preferredJobTypes: z
    .array(z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'REMOTE']))
    .default([]),
  preferredLocations: z.array(LocationSchema).default([]),
  preferredSalary: z
    .object({
      min: z.number().positive(),
      max: z.number().positive(),
      currency: z.string().default('USD'),
    })
    .optional(),
  preferredRadius: z.number().positive().default(50),
  languages: z
    .array(
      z.object({
        language: z.string(),
        proficiency: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'NATIVE']),
      })
    )
    .default([]),
  availability: z
    .enum(['IMMEDIATELY', 'ONE_WEEK', 'TWO_WEEKS', 'ONE_MONTH', 'NOT_AVAILABLE'])
    .default('IMMEDIATELY'),
  searchVisibility: z.boolean().default(true),
});

export const EmployerProfileSchema = z.object({
  companyName: z.string().min(1).max(200),
  companySize: z.enum(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']),
  companyType: z.enum(['STARTUP', 'SME', 'CORPORATION', 'NON_PROFIT', 'GOVERNMENT', 'EDUCATION']),
  industry: z.string().min(1).max(100),
  website: z.string().url().optional(),
  logoUrl: z.string().url().optional(),
  description: z.string().max(2000),
  headquarters: LocationSchema,
  branches: z.array(LocationSchema).default([]),
  linkedInUrl: z.string().url().optional(),
  twitterUrl: z.string().url().optional(),
  verified: z.boolean().default(false),
  verifiedAt: z.coerce.date().optional(),
  subscriptionPlan: z.enum(['FREE', 'BASIC', 'PREMIUM', 'ENTERPRISE']).default('FREE'),
  subscriptionExpiresAt: z.coerce.date().optional(),
  maxJobPostings: z.number().positive().default(5),
  activeJobPostings: z.number().nonnegative().default(0),
});

export const UserSchema = z.discriminatedUnion('role', [
  BaseUserSchema.extend({
    role: z.literal('JOB_SEEKER'),
    profile: JobSeekerProfileSchema,
  }),
  BaseUserSchema.extend({
    role: z.literal('EMPLOYER'),
    profile: EmployerProfileSchema,
  }),
  BaseUserSchema.extend({
    role: z.literal('ADMIN'),
    profile: z.record(z.unknown()),
  }),
]);

export type User = z.infer<typeof UserSchema>;
export type JobSeekerProfile = z.infer<typeof JobSeekerProfileSchema>;
export type EmployerProfile = z.infer<typeof EmployerProfileSchema>;
export type BaseUser = z.infer<typeof BaseUserSchema>;

// Registration and update schemas
export const RegisterJobSeekerSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8).max(128),
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    phone: z.string().optional(),
  })
  .strict();

export const RegisterEmployerSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8).max(128),
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    phone: z.string().optional(),
    companyName: z.string().min(1).max(200),
    companySize: z.enum(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']),
    companyType: z.enum(['STARTUP', 'SME', 'CORPORATION', 'NON_PROFIT', 'GOVERNMENT', 'EDUCATION']),
    industry: z.string().min(1).max(100),
    headquarters: LocationSchema,
  })
  .strict();

export const UpdateJobSeekerProfileSchema = JobSeekerProfileSchema.partial()
  .extend({
    preferredSalary: z
      .object({
        min: z.number().positive(),
        max: z.number().positive(),
        currency: z.string().default('USD'),
      })
      .optional(),
  })
  .strict();

export const UpdateEmployerProfileSchema = EmployerProfileSchema.partial().strict();

export type RegisterJobSeeker = z.infer<typeof RegisterJobSeekerSchema>;
export type RegisterEmployer = z.infer<typeof RegisterEmployerSchema>;
export type UpdateJobSeekerProfile = z.infer<typeof UpdateJobSeekerProfileSchema>;
export type UpdateEmployerProfile = z.infer<typeof UpdateEmployerProfileSchema>;
