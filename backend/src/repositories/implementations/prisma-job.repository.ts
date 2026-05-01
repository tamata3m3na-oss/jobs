import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { JobSearchFilters } from '@smartjob/shared';
import {
  IJobRepository,
  CreateJobInput,
  UpdateJobInput,
  JobFilterInput,
} from '../interfaces/i-job.repository';

@Injectable()
export class PrismaJobRepository implements IJobRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateJobInput): Promise<Record<string, unknown>> {
    const job = await this.prisma.job.create({
      data: {
        employerId: data.employerId,
        title: data.title,
        slug: data.slug,
        description: data.description,
        shortDescription: data.shortDescription,
        requirements: data.requirements ?? [],
        responsibilities: data.responsibilities ?? [],
        niceToHave: data.niceToHave ?? [],
        skills: data.skills ?? [],
        jobType: data.jobType,
        experienceLevel: data.experienceLevel ?? 'MID',
        location: data.location,
        locationDetails: data.locationDetails ?? null,
        salaryMin: data.salaryMin ?? null,
        salaryMax: data.salaryMax ?? null,
        salaryCurrency: data.salaryCurrency ?? 'USD',
        salaryPeriod: data.salaryPeriod ?? 'YEARLY',
        salaryNegotiable: data.salaryNegotiable ?? false,
        salaryCompetitive: data.salaryCompetitive ?? true,
        benefits: data.benefits ?? {},
        applicationQuestions: data.applicationQuestions ?? [],
        applicationDeadline: data.applicationDeadline ?? null,
        startDate: data.startDate ?? null,
        openings: data.openings ?? 1,
        status: data.status ?? 'DRAFT',
        featured: data.featured ?? false,
        screeningCriteria: data.screeningCriteria ?? [],
        matchSettings: data.matchSettings ?? {},
      },
    });

    return job as unknown as Record<string, unknown>;
  }

  async findById(id: string): Promise<Record<string, unknown> | null> {
    const job = await this.prisma.job.findUnique({
      where: { id },
    });

    return job as unknown as Record<string, unknown> | null;
  }

  async findBySlug(slug: string): Promise<Record<string, unknown> | null> {
    const job = await this.prisma.job.findUnique({
      where: { slug },
    });

    return job as unknown as Record<string, unknown> | null;
  }

  async findAll(
    filter: JobFilterInput,
    pagination: { page: number; limit: number }
  ): Promise<{
    data: Record<string, unknown>[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const where: Record<string, unknown> = {};

    if (filter.employerId) {
      where.employerId = filter.employerId;
    }

    if (filter.status) {
      where.status = filter.status;
    }

    if (filter.jobType) {
      where.jobType = filter.jobType;
    }

    if (filter.experienceLevel) {
      where.experienceLevel = filter.experienceLevel;
    }

    const [jobs, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.job.count({ where }),
    ]);

    return {
      data: jobs as unknown as Record<string, unknown>[],
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    };
  }

  async search(filters: JobSearchFilters): Promise<{
    data: Record<string, unknown>[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const where: Record<string, unknown> = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.employerId) {
      where.employerId = filters.employerId;
    }

    if (filters.jobTypes && filters.jobTypes.length > 0) {
      where.jobType = { in: filters.jobTypes };
    }

    if (filters.experienceLevels && filters.experienceLevels.length > 0) {
      where.experienceLevel = { in: filters.experienceLevels };
    }

    if (filters.query) {
      where.OR = [
        { title: { contains: filters.query, mode: 'insensitive' } },
        { description: { contains: filters.query, mode: 'insensitive' } },
        { skills: { hasSome: [filters.query] } },
      ];
    }

    if (filters.postedWithin && filters.postedWithin !== 'ANY') {
      const now = new Date();
      let dateFilter: Date;

      switch (filters.postedWithin) {
        case '24_HOURS':
          dateFilter = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7_DAYS':
          dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30_DAYS':
          dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90_DAYS':
          dateFilter = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          dateFilter = new Date(0);
      }

      where.createdAt = { gte: dateFilter };
    }

    const orderBy: Record<string, string> = filters.sortBy === 'salary'
      ? { salaryMax: filters.sortOrder }
      : { createdAt: 'desc' };

    const [jobs, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        orderBy,
      }),
      this.prisma.job.count({ where }),
    ]);

    return {
      data: jobs as unknown as Record<string, unknown>[],
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.ceil(total / filters.limit),
    };
  }

  async update(id: string, data: UpdateJobInput): Promise<Record<string, unknown>> {
    const updateData: Record<string, unknown> = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.shortDescription !== undefined) updateData.shortDescription = data.shortDescription;
    if (data.requirements !== undefined) updateData.requirements = data.requirements;
    if (data.responsibilities !== undefined) updateData.responsibilities = data.responsibilities;
    if (data.niceToHave !== undefined) updateData.niceToHave = data.niceToHave;
    if (data.skills !== undefined) updateData.skills = data.skills;
    if (data.jobType !== undefined) updateData.jobType = data.jobType;
    if (data.experienceLevel !== undefined) updateData.experienceLevel = data.experienceLevel;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.locationDetails !== undefined) updateData.locationDetails = data.locationDetails;
    if (data.salaryMin !== undefined) updateData.salaryMin = data.salaryMin;
    if (data.salaryMax !== undefined) updateData.salaryMax = data.salaryMax;
    if (data.salaryCurrency !== undefined) updateData.salaryCurrency = data.salaryCurrency;
    if (data.salaryPeriod !== undefined) updateData.salaryPeriod = data.salaryPeriod;
    if (data.salaryNegotiable !== undefined) updateData.salaryNegotiable = data.salaryNegotiable;
    if (data.salaryCompetitive !== undefined) updateData.salaryCompetitive = data.salaryCompetitive;
    if (data.benefits !== undefined) updateData.benefits = data.benefits;
    if (data.applicationQuestions !== undefined) updateData.applicationQuestions = data.applicationQuestions;
    if (data.applicationDeadline !== undefined) updateData.applicationDeadline = data.applicationDeadline;
    if (data.startDate !== undefined) updateData.startDate = data.startDate;
    if (data.openings !== undefined) updateData.openings = data.openings;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.featured !== undefined) updateData.featured = data.featured;
    if (data.publishedAt !== undefined) updateData.publishedAt = data.publishedAt;
    if (data.expiresAt !== undefined) updateData.expiresAt = data.expiresAt;
    if (data.closedAt !== undefined) updateData.closedAt = data.closedAt;
    if (data.aiGeneratedDescription !== undefined) updateData.aiGeneratedDescription = data.aiGeneratedDescription;
    if (data.screeningCriteria !== undefined) updateData.screeningCriteria = data.screeningCriteria;
    if (data.matchSettings !== undefined) updateData.matchSettings = data.matchSettings;

    const job = await this.prisma.job.update({
      where: { id },
      data: updateData,
    });

    return job as unknown as Record<string, unknown>;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.job.delete({
      where: { id },
    });
  }

  async incrementViews(id: string): Promise<void> {
    await this.prisma.job.update({
      where: { id },
      data: { views: { increment: 1 } },
    });
  }

  async updateApplicationsCount(id: string, count: number): Promise<void> {
    await this.prisma.job.update({
      where: { id },
      data: { applicationsCount: count },
    });
  }

  async existsBySlug(slug: string): Promise<boolean> {
    const count = await this.prisma.job.count({
      where: { slug },
    });

    return count > 0;
  }

  async findByEmployer(
    employerId: string,
    pagination: { page: number; limit: number }
  ): Promise<{
    data: Record<string, unknown>[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const [jobs, total] = await Promise.all([
      this.prisma.job.findMany({
        where: { employerId },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.job.count({ where: { employerId } }),
    ]);

    return {
      data: jobs as unknown as Record<string, unknown>[],
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    };
  }
}