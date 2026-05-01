import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  ApplicationStatus,
  ApplicationSearchFilters,
} from '@smartjob/shared';
import {
  IApplicationRepository,
  CreateApplicationInput,
  UpdateApplicationInput,
  ApplicationFilterInput,
} from '../interfaces/i-application.repository';

@Injectable()
export class PrismaApplicationRepository implements IApplicationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateApplicationInput): Promise<Record<string, unknown>> {
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
        sourceType: sourceType as 'DIRECT' | 'REFERRAL' | 'LINKEDIN' | 'INDEED' | 'OTHER_JOB_BOARD' | 'SOCIAL_MEDIA' | 'EMAIL',
        sourceReferralId: data.source?.referralId ?? null,
        sourceUtmSource: data.source?.utmData?.source ?? null,
        sourceUtmMedium: data.source?.utmData?.medium ?? null,
        sourceUtmCampaign: data.source?.utmData?.campaign ?? null,
        status: 'SUBMITTED',
      },
    });

    return application as unknown as Record<string, unknown>;
  }

  async findById(id: string): Promise<Record<string, unknown> | null> {
    const application = await this.prisma.application.findUnique({
      where: { id },
    });

    return application as unknown as Record<string, unknown> | null;
  }

  async findAll(
    filter: ApplicationFilterInput,
    pagination: { page: number; limit: number }
  ): Promise<{
    data: Record<string, unknown>[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
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

    const [applications, total] = await Promise.all([
      this.prisma.application.findMany({
        where,
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        orderBy: { submittedAt: 'desc' },
      }),
      this.prisma.application.count({ where }),
    ]);

    return {
      data: applications as unknown as Record<string, unknown>[],
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    };
  }

  async search(filters: ApplicationSearchFilters): Promise<{
    data: Record<string, unknown>[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
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
      where.submittedAt = { ...((where.submittedAt as Record<string, unknown>) ?? {}), gte: filters.submittedAfter };
    }

    if (filters.submittedBefore) {
      where.submittedAt = { ...((where.submittedAt as Record<string, unknown>) ?? {}), lte: filters.submittedBefore };
    }

    const orderBy: Record<string, string> = filters.sortBy === 'matchScore'
      ? { matchScore: filters.sortOrder }
      : filters.sortBy === 'status'
        ? { status: filters.sortOrder }
        : { submittedAt: 'desc' };

    const [applications, total] = await Promise.all([
      this.prisma.application.findMany({
        where,
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        orderBy,
      }),
      this.prisma.application.count({ where }),
    ]);

    return {
      data: applications as unknown as Record<string, unknown>[],
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.ceil(total / filters.limit),
    };
  }

  async update(id: string, data: UpdateApplicationInput): Promise<Record<string, unknown>> {
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
    if (data.offeredSalary !== undefined) {
      updateData.offeredSalaryAmount = data.offeredSalary.amount;
      updateData.offeredSalaryCurrency = data.offeredSalary.currency;
      updateData.offeredSalaryPeriod = data.offeredSalary.period;
    }
    if (data.lastActivityAt !== undefined) updateData.lastActivityAt = data.lastActivityAt;
    if (data.expiresAt !== undefined) updateData.expiresAt = data.expiresAt;

    const application = await this.prisma.application.update({
      where: { id },
      data: updateData,
    });

    return application as unknown as Record<string, unknown>;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.application.delete({
      where: { id },
    });
  }

  async updateStatus(id: string, status: ApplicationStatus): Promise<Record<string, unknown>> {
    const application = await this.prisma.application.update({
      where: { id },
      data: {
        status,
        lastActivityAt: new Date(),
      },
    });

    return application as unknown as Record<string, unknown>;
  }

  async addInterview(id: string, interview: unknown): Promise<Record<string, unknown>> {
    const application = await this.prisma.application.findUnique({
      where: { id },
    });

    if (!application) {
      throw new Error('Application not found');
    }

    const interviews = (application.interviews as unknown[]) ?? [];
    interviews.push(interview);

    const updated = await this.prisma.application.update({
      where: { id },
      data: {
        interviews: interviews as unknown,
        status: 'INTERVIEW_SCHEDULED',
        lastActivityAt: new Date(),
      },
    });

    return updated as unknown as Record<string, unknown>;
  }

  async submitFeedback(
    id: string,
    interviewId: string,
    feedback: unknown
  ): Promise<Record<string, unknown>> {
    const application = await this.prisma.application.findUnique({
      where: { id },
    });

    if (!application) {
      throw new Error('Application not found');
    }

    const interviews = (application.interviews as unknown[]) ?? [];
    const interviewIndex = interviews.findIndex(
      (i: unknown) => (i as { id?: string }).id === interviewId
    );

    if (interviewIndex !== -1) {
      (interviews[interviewIndex] as { feedback?: unknown }).feedback = feedback;
      (interviews[interviewIndex] as { status?: string }).status = 'COMPLETED';
    }

    const updated = await this.prisma.application.update({
      where: { id },
      data: {
        interviews: interviews as unknown,
        status: 'INTERVIEW_COMPLETED',
        lastActivityAt: new Date(),
      },
    });

    return updated as unknown as Record<string, unknown>;
  }

  async existsByJobAndApplicant(jobId: string, applicantId: string): Promise<boolean> {
    const count = await this.prisma.application.count({
      where: { jobId, applicantId },
    });

    return count > 0;
  }

  async findByJob(
    jobId: string,
    pagination: { page: number; limit: number }
  ): Promise<{
    data: Record<string, unknown>[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const [applications, total] = await Promise.all([
      this.prisma.application.findMany({
        where: { jobId },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        orderBy: { submittedAt: 'desc' },
      }),
      this.prisma.application.count({ where: { jobId } }),
    ]);

    return {
      data: applications as unknown as Record<string, unknown>[],
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    };
  }

  async findByApplicant(
    applicantId: string,
    pagination: { page: number; limit: number }
  ): Promise<{
    data: Record<string, unknown>[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const [applications, total] = await Promise.all([
      this.prisma.application.findMany({
        where: { applicantId },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        orderBy: { submittedAt: 'desc' },
      }),
      this.prisma.application.count({ where: { applicantId } }),
    ]);

    return {
      data: applications as unknown as Record<string, unknown>[],
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    };
  }
}