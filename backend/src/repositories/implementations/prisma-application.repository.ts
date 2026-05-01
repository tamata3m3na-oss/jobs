import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ApplicationStatus, ApplicationSearchFilters } from '@smartjob/shared';
import {
  IApplicationRepository,
  CreateApplicationInput,
  UpdateApplicationInput,
  ApplicationFilterInput,
  ApplicationWithRelations,
  PaginationOptions,
  PaginatedResult,
  InterviewData,
  EmployerNoteData,
  ApplicationStats,
} from '../interfaces/i-application.repository';

@Injectable()
export class PrismaApplicationRepository implements IApplicationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateApplicationInput): Promise<ApplicationWithRelations> {
    const sourceType = data.source?.type ?? 'DIRECT';

    const application = await this.prisma.application.create({
      data: {
        jobId: data.jobId,
        applicantId: data.applicantId,
        employerId: data.employerId,
        answers: data.answers ?? [],
        resumeUrl: data.resumeUrl ?? null,
        coverLetterUrl: data.coverLetterUrl ?? null,
        portfolioUrls: data.portfolioUrls ?? [],
        sourceType: sourceType as
          | 'DIRECT'
          | 'REFERRAL'
          | 'LINKEDIN'
          | 'INDEED'
          | 'OTHER_JOB_BOARD'
          | 'SOCIAL_MEDIA'
          | 'EMAIL',
        sourceReferralId: data.source?.referralId ?? null,
        sourceUtmSource: data.source?.utmData?.source ?? null,
        sourceUtmMedium: data.source?.utmData?.medium ?? null,
        sourceUtmCampaign: data.source?.utmData?.campaign ?? null,
        status: 'SUBMITTED',
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
            employer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
        applicant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    return this.mapToApplicationWithRelations(application);
  }

  async findById(id: string): Promise<ApplicationWithRelations | null> {
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
            employer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
        applicant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!application) {
      return null;
    }

    return this.mapToApplicationWithRelations(application);
  }

  async findByJobAndApplicant(
    jobId: string,
    applicantId: string
  ): Promise<ApplicationWithRelations | null> {
    const application = await this.prisma.application.findUnique({
      where: { jobId_applicantId: { jobId, applicantId } },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
            employer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
        applicant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!application) {
      return null;
    }

    return this.mapToApplicationWithRelations(application);
  }

  async findByJob(
    jobId: string,
    pagination: PaginationOptions
  ): Promise<PaginatedResult<ApplicationWithRelations>> {
    const skip = (pagination.page - 1) * pagination.limit;
    const orderBy = this.buildOrderBy(pagination.sortBy, pagination.sortOrder);

    const [applications, total] = await Promise.all([
      this.prisma.application.findMany({
        where: { jobId },
        skip,
        take: pagination.limit,
        orderBy,
        include: {
          job: {
            select: {
              id: true,
              title: true,
              slug: true,
              status: true,
              employer: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  avatarUrl: true,
                },
              },
            },
          },
          applicant: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      }),
      this.prisma.application.count({ where: { jobId } }),
    ]);

    return {
      data: applications.map((app) => this.mapToApplicationWithRelations(app)),
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    };
  }

  async findByApplicant(
    applicantId: string,
    pagination: PaginationOptions
  ): Promise<PaginatedResult<ApplicationWithRelations>> {
    const skip = (pagination.page - 1) * pagination.limit;
    const orderBy = this.buildOrderBy(pagination.sortBy, pagination.sortOrder);

    const [applications, total] = await Promise.all([
      this.prisma.application.findMany({
        where: { applicantId },
        skip,
        take: pagination.limit,
        orderBy,
        include: {
          job: {
            select: {
              id: true,
              title: true,
              slug: true,
              status: true,
              employer: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  avatarUrl: true,
                },
              },
            },
          },
          applicant: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      }),
      this.prisma.application.count({ where: { applicantId } }),
    ]);

    return {
      data: applications.map((app) => this.mapToApplicationWithRelations(app)),
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    };
  }

  async findByEmployer(
    employerId: string,
    pagination: PaginationOptions
  ): Promise<PaginatedResult<ApplicationWithRelations>> {
    const skip = (pagination.page - 1) * pagination.limit;
    const orderBy = this.buildOrderBy(pagination.sortBy, pagination.sortOrder);

    const [applications, total] = await Promise.all([
      this.prisma.application.findMany({
        where: { employerId },
        skip,
        take: pagination.limit,
        orderBy,
        include: {
          job: {
            select: {
              id: true,
              title: true,
              slug: true,
              status: true,
              employer: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  avatarUrl: true,
                },
              },
            },
          },
          applicant: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      }),
      this.prisma.application.count({ where: { employerId } }),
    ]);

    return {
      data: applications.map((app) => this.mapToApplicationWithRelations(app)),
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    };
  }

  async findAll(
    filter: ApplicationFilterInput,
    pagination: PaginationOptions
  ): Promise<PaginatedResult<ApplicationWithRelations>> {
    const where: Record<string, unknown> = {};

    if (filter.jobId) {
      where.jobId = filter.jobId;
    }

    if (filter.applicantId) {
      where.applicantId = filter.applicantId;
    }

    if (filter.employerId) {
      where.employerId = filter.employerId;
    }

    if (filter.status) {
      if (Array.isArray(filter.status)) {
        where.status = { in: filter.status };
      } else {
        where.status = filter.status;
      }
    }

    const skip = (pagination.page - 1) * pagination.limit;
    const orderBy = this.buildOrderBy(pagination.sortBy, pagination.sortOrder);

    const [applications, total] = await Promise.all([
      this.prisma.application.findMany({
        where,
        skip,
        take: pagination.limit,
        orderBy,
        include: {
          job: {
            select: {
              id: true,
              title: true,
              slug: true,
              status: true,
              employer: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  avatarUrl: true,
                },
              },
            },
          },
          applicant: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      }),
      this.prisma.application.count({ where }),
    ]);

    return {
      data: applications.map((app) => this.mapToApplicationWithRelations(app)),
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    };
  }

  async search(
    filters: ApplicationSearchFilters
  ): Promise<PaginatedResult<ApplicationWithRelations>> {
    const where: Record<string, unknown> = {};

    if (filters.jobId) {
      where.jobId = filters.jobId;
    }

    if (filters.applicantId) {
      where.applicantId = filters.applicantId;
    }

    if (filters.employerId) {
      where.employerId = filters.employerId;
    }

    if (filters.status) {
      if (Array.isArray(filters.status)) {
        where.status = { in: filters.status };
      } else {
        where.status = filters.status;
      }
    }

    if (filters.matchScoreMin !== undefined || filters.matchScoreMax !== undefined) {
      where.matchScore = {};
      if (filters.matchScoreMin !== undefined) {
        (where.matchScore as Record<string, unknown>).gte = filters.matchScoreMin;
      }
      if (filters.matchScoreMax !== undefined) {
        (where.matchScore as Record<string, unknown>).lte = filters.matchScoreMax;
      }
    }

    if (filters.submittedAfter) {
      where.submittedAt = {
        ...((where.submittedAt as Record<string, unknown>) ?? {}),
        gte: filters.submittedAfter,
      };
    }

    if (filters.submittedBefore) {
      where.submittedAt = {
        ...((where.submittedAt as Record<string, unknown>) ?? {}),
        lte: filters.submittedBefore,
      };
    }

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;
    const orderBy = this.buildOrderBy(filters.sortBy || 'date', filters.sortOrder || 'desc');

    const [applications, total] = await Promise.all([
      this.prisma.application.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          job: {
            select: {
              id: true,
              title: true,
              slug: true,
              status: true,
              employer: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  avatarUrl: true,
                },
              },
            },
          },
          applicant: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      }),
      this.prisma.application.count({ where }),
    ]);

    return {
      data: applications.map((app) => this.mapToApplicationWithRelations(app)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async paginate(
    page: number,
    limit: number,
    filters?: ApplicationSearchFilters
  ): Promise<PaginatedResult<ApplicationWithRelations>> {
    if (filters) {
      return this.search(filters);
    }

    const skip = (page - 1) * limit;

    const [applications, total] = await Promise.all([
      this.prisma.application.findMany({
        skip,
        take: limit,
        orderBy: { submittedAt: 'desc' },
        include: {
          job: {
            select: {
              id: true,
              title: true,
              slug: true,
              status: true,
              employer: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  avatarUrl: true,
                },
              },
            },
          },
          applicant: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      }),
      this.prisma.application.count(),
    ]);

    return {
      data: applications.map((app) => this.mapToApplicationWithRelations(app)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(id: string, data: UpdateApplicationInput): Promise<ApplicationWithRelations> {
    const updateData: Record<string, unknown> = {};

    if (data.status !== undefined) updateData.status = data.status;
    if (data.answers !== undefined) updateData.answers = data.answers;
    if (data.resumeUrl !== undefined) updateData.resumeUrl = data.resumeUrl;
    if (data.coverLetterUrl !== undefined) updateData.coverLetterUrl = data.coverLetterUrl;
    if (data.portfolioUrls !== undefined) updateData.portfolioUrls = data.portfolioUrls;
    if (data.matchScore !== undefined) updateData.matchScore = data.matchScore;
    if (data.aiAnalysis !== undefined) updateData.aiAnalysis = data.aiAnalysis;
    if (data.interviews !== undefined) updateData.interviews = data.interviews;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.employerNotes !== undefined) updateData.employerNotes = data.employerNotes;
    if (data.rejectionReason !== undefined) updateData.rejectionReason = data.rejectionReason;
    if (data.offeredSalary) {
      updateData.offeredSalaryAmount = data.offeredSalary.amount;
      updateData.offeredSalaryCurrency = data.offeredSalary.currency;
      updateData.offeredSalaryPeriod = data.offeredSalary.period;
    }
    if (data.lastActivityAt !== undefined) updateData.lastActivityAt = data.lastActivityAt;
    if (data.expiresAt !== undefined) updateData.expiresAt = data.expiresAt;

    const application = await this.prisma.application.update({
      where: { id },
      data: updateData,
      include: {
        job: {
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
            employer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
        applicant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    return this.mapToApplicationWithRelations(application);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.application.delete({
      where: { id },
    });
  }

  async updateStatus(id: string, status: ApplicationStatus): Promise<ApplicationWithRelations> {
    const application = await this.prisma.application.update({
      where: { id },
      data: {
        status,
        lastActivityAt: new Date(),
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
            employer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
        applicant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    return this.mapToApplicationWithRelations(application);
  }

  async addInterview(id: string, interview: InterviewData): Promise<ApplicationWithRelations> {
    const application = await this.prisma.application.findUnique({
      where: { id },
    });

    if (!application) {
      throw new Error('Application not found');
    }

    const existingInterviews: InterviewData[] = Array.isArray(application.interviews)
      ? (application.interviews as unknown as InterviewData[])
      : [];
    const updatedInterviews: InterviewData[] = [...existingInterviews, interview];

    const updated = await this.prisma.application.update({
      where: { id },
      data: {
        interviews: updatedInterviews as unknown as object,
        status: 'INTERVIEW_SCHEDULED',
        lastActivityAt: new Date(),
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
            employer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
        applicant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    return this.mapToApplicationWithRelations(updated);
  }

  async addNote(id: string, note: EmployerNoteData): Promise<ApplicationWithRelations> {
    const application = await this.prisma.application.findUnique({
      where: { id },
    });

    if (!application) {
      throw new Error('Application not found');
    }

    const existingNotes: EmployerNoteData[] = Array.isArray(application.employerNotes)
      ? (application.employerNotes as unknown as EmployerNoteData[])
      : [];
    const updatedNotes: EmployerNoteData[] = [...existingNotes, note];

    const updated = await this.prisma.application.update({
      where: { id },
      data: {
        employerNotes: updatedNotes as unknown as object,
        lastActivityAt: new Date(),
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
            employer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
        applicant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    return this.mapToApplicationWithRelations(updated);
  }

  async existsByJobAndApplicant(jobId: string, applicantId: string): Promise<boolean> {
    const count = await this.prisma.application.count({
      where: { jobId, applicantId },
    });

    return count > 0;
  }

  async getApplicationStats(jobId: string): Promise<ApplicationStats> {
    const [applications, statusBreakdown, avgScore] = await Promise.all([
      this.prisma.application.count({ where: { jobId } }),
      this.prisma.application.groupBy({
        by: ['status'],
        where: { jobId },
        _count: { id: true },
      }),
      this.prisma.application.aggregate({
        where: { jobId, matchScore: { not: null } },
        _avg: { matchScore: true },
      }),
    ]);

    const breakdown: Record<string, number> = {};
    for (const item of statusBreakdown) {
      breakdown[item.status] = item._count.id;
    }

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const [newApplications, pendingReview, inInterview] = await Promise.all([
      this.prisma.application.count({
        where: { jobId, submittedAt: { gte: oneWeekAgo } },
      }),
      this.prisma.application.count({
        where: { jobId, status: { in: ['SUBMITTED', 'UNDER_REVIEW'] } },
      }),
      this.prisma.application.count({
        where: {
          jobId,
          status: { in: ['SHORTLISTED', 'INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED'] },
        },
      }),
    ]);

    return {
      totalApplications: applications,
      statusBreakdown: breakdown,
      averageMatchScore: avgScore._avg.matchScore,
      newApplications,
      pendingReview,
      inInterview,
    };
  }

  private buildOrderBy(
    sortBy?: 'date' | 'matchScore' | 'status',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Record<string, string> {
    switch (sortBy) {
      case 'matchScore':
        return { matchScore: sortOrder };
      case 'status':
        return { status: sortOrder };
      default:
        return { submittedAt: sortOrder };
    }
  }

  private mapToApplicationWithRelations(application: {
    id: string;
    jobId: string;
    applicantId: string;
    employerId: string;
    status: ApplicationStatus;
    answers: unknown;
    resumeUrl: string | null;
    coverLetterUrl: string | null;
    portfolioUrls: unknown;
    matchScore: number | null;
    aiAnalysis: unknown;
    interviews: unknown;
    notes: string | null;
    employerNotes: unknown;
    rejectionReason: string | null;
    offeredSalaryAmount: unknown;
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
  }): ApplicationWithRelations {
    const mapJob = (j: typeof application.job): ApplicationWithRelations['job'] => {
      if (!j) return null;
      return {
        id: j.id,
        title: j.title,
        slug: j.slug,
        status: j.status,
        employer: j.employer,
      };
    };

    const mapApplicant = (
      a: typeof application.applicant
    ): ApplicationWithRelations['applicant'] => {
      if (!a) return null;
      return {
        id: a.id,
        firstName: a.firstName,
        lastName: a.lastName,
        email: a.email,
        avatarUrl: a.avatarUrl,
      };
    };

    return {
      id: application.id,
      jobId: application.jobId,
      applicantId: application.applicantId,
      employerId: application.employerId,
      status: application.status,
      answers: application.answers as ApplicationWithRelations['answers'],
      resumeUrl: application.resumeUrl,
      coverLetterUrl: application.coverLetterUrl,
      portfolioUrls: (Array.isArray(application.portfolioUrls)
        ? application.portfolioUrls
        : []) as string[],
      matchScore: application.matchScore,
      aiAnalysis: application.aiAnalysis as ApplicationWithRelations['aiAnalysis'],
      interviews: (application.interviews || []) as ApplicationWithRelations['interviews'],
      notes: application.notes,
      employerNotes: (application.employerNotes || []) as ApplicationWithRelations['employerNotes'],
      rejectionReason: application.rejectionReason,
      offeredSalaryAmount: application.offeredSalaryAmount
        ? Number(application.offeredSalaryAmount)
        : null,
      offeredSalaryCurrency: application.offeredSalaryCurrency,
      offeredSalaryPeriod:
        application.offeredSalaryPeriod as ApplicationWithRelations['offeredSalaryPeriod'],
      sourceType: application.sourceType,
      sourceReferralId: application.sourceReferralId,
      sourceUtmSource: application.sourceUtmSource,
      sourceUtmMedium: application.sourceUtmMedium,
      sourceUtmCampaign: application.sourceUtmCampaign,
      submittedAt:
        application.submittedAt instanceof Date
          ? application.submittedAt
          : new Date(application.submittedAt),
      updatedAt:
        application.updatedAt instanceof Date
          ? application.updatedAt
          : new Date(application.updatedAt),
      lastActivityAt:
        application.lastActivityAt instanceof Date
          ? application.lastActivityAt
          : new Date(application.lastActivityAt),
      expiresAt: application.expiresAt
        ? application.expiresAt instanceof Date
          ? application.expiresAt
          : new Date(application.expiresAt)
        : null,
      createdAt:
        application.createdAt instanceof Date
          ? application.createdAt
          : new Date(application.createdAt),
      job: mapJob(application.job),
      applicant: mapApplicant(application.applicant),
    };
  }
}
