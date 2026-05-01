import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { JobSearchFilters, JobStatus } from '@smartjob/shared';
import {
  IJobRepository,
  CreateJobInput,
  UpdateJobInput,
  JobFilterInput,
  JobListResult,
  JobWithEmployerResult,
  JobStats,
} from '../interfaces/i-job.repository';

@Injectable()
export class PrismaJobRepository implements IJobRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateJobInput): Promise<JobWithEmployerResult> {
    const prismaJob = this.prisma.job as any;
    const job = await prismaJob.create({
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
        locationDetails: data.locationDetails ?? undefined,
        salaryMin: data.salaryMin ?? undefined,
        salaryMax: data.salaryMax ?? undefined,
        salaryCurrency: data.salaryCurrency ?? 'USD',
        salaryPeriod: data.salaryPeriod ?? 'YEARLY',
        salaryNegotiable: data.salaryNegotiable ?? false,
        salaryCompetitive: data.salaryCompetitive ?? true,
        benefits: data.benefits ?? {},
        applicationQuestions: data.applicationQuestions ?? [],
        applicationDeadline: data.applicationDeadline ?? undefined,
        startDate: data.startDate ?? undefined,
        openings: data.openings ?? 1,
        status: data.status ?? 'DRAFT',
        featured: data.featured ?? false,
        screeningCriteria: data.screeningCriteria ?? [],
        matchSettings: data.matchSettings ?? {},
      },
      include: {
        employer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
            profile: true,
          },
        },
      },
    });

    return this.mapJobToResult(job);
  }

  async findById(id: string): Promise<JobWithEmployerResult | null> {
    const prismaJob = this.prisma.job as any;
    const job = await prismaJob.findUnique({
      where: { id },
      include: {
        employer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
            profile: true,
          },
        },
      },
    });

    if (!job) return null;

    return this.mapJobToResult(job);
  }

  async findByIdWithEmployer(id: string): Promise<JobWithEmployerResult | null> {
    return this.findById(id);
  }

  async findBySlug(slug: string): Promise<JobWithEmployerResult | null> {
    const prismaJob = this.prisma.job as any;
    const job = await prismaJob.findUnique({
      where: { slug },
      include: {
        employer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
            profile: true,
          },
        },
      },
    });

    if (!job) return null;

    return this.mapJobToResult(job);
  }

  async findBySlugWithEmployer(slug: string): Promise<JobWithEmployerResult | null> {
    return this.findBySlug(slug);
  }

  async findAll(
    filter: JobFilterInput,
    pagination: { page: number; limit: number; sortBy?: string; sortOrder?: string }
  ): Promise<JobListResult> {
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

    const orderBy = this.buildOrderBy(pagination.sortBy, pagination.sortOrder);
    const prismaJob = this.prisma.job as any;

    const [jobs, total] = await Promise.all([
      prismaJob.findMany({
        where,
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        orderBy,
        include: {
          employer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatarUrl: true,
              profile: true,
            },
          },
        },
      }),
      this.prisma.job.count({ where }),
    ]);

    return {
      data: jobs.map((job: any) => this.mapJobToResult(job)),
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    };
  }

  async search(filters: JobSearchFilters): Promise<JobListResult> {
    const where: Record<string, unknown> = {};

    if (filters.status) {
      where.status = filters.status;
    } else {
      where.status = 'ACTIVE';
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
      const searchTerms = filters.query.trim().split(/\s+/);
      where.AND = searchTerms.map((term) => ({
        OR: [
          { title: { contains: term, mode: 'insensitive' } },
          { description: { contains: term, mode: 'insensitive' } },
          { shortDescription: { contains: term, mode: 'insensitive' } },
          { skills: { hasSome: [term] } },
          { requirements: { hasSome: [term] } },
        ],
      }));
    }

    if (filters.skills && filters.skills.length > 0) {
      where.skills = { hasSome: filters.skills };
    }

    if (filters.salaryMin) {
      where.salaryMax = { gte: filters.salaryMin };
    }

    if (filters.salaryMax) {
      where.salaryMin = { lte: filters.salaryMax };
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

    const orderBy = this.buildSearchOrderBy(filters.sortBy, filters.sortOrder);
    const prismaJob = this.prisma.job as any;

    const [jobs, total] = await Promise.all([
      prismaJob.findMany({
        where,
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        orderBy,
        include: {
          employer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatarUrl: true,
              profile: true,
            },
          },
        },
      }),
      this.prisma.job.count({ where }),
    ]);

    return {
      data: jobs.map((job: any) => this.mapJobToResult(job)),
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.ceil(total / filters.limit),
    };
  }

  async paginate(page: number, limit: number, filters?: JobFilterInput): Promise<JobListResult> {
    return this.findAll(filters ?? {}, { page, limit });
  }

  async update(id: string, data: UpdateJobInput): Promise<JobWithEmployerResult> {
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
    if (data.applicationQuestions !== undefined)
      updateData.applicationQuestions = data.applicationQuestions;
    if (data.applicationDeadline !== undefined)
      updateData.applicationDeadline = data.applicationDeadline;
    if (data.startDate !== undefined) updateData.startDate = data.startDate;
    if (data.openings !== undefined) updateData.openings = data.openings;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.featured !== undefined) updateData.featured = data.featured;
    if (data.publishedAt !== undefined) updateData.publishedAt = data.publishedAt;
    if (data.expiresAt !== undefined) updateData.expiresAt = data.expiresAt;
    if (data.closedAt !== undefined) updateData.closedAt = data.closedAt;
    if (data.aiGeneratedDescription !== undefined)
      updateData.aiGeneratedDescription = data.aiGeneratedDescription;
    if (data.screeningCriteria !== undefined) updateData.screeningCriteria = data.screeningCriteria;
    if (data.matchSettings !== undefined) updateData.matchSettings = data.matchSettings;

    const prismaJob = this.prisma.job as any;
    const job = await prismaJob.update({
      where: { id },
      data: updateData,
      include: {
        employer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
            profile: true,
          },
        },
      },
    });

    return this.mapJobToResult(job);
  }

  async updateStatus(id: string, status: JobStatus): Promise<JobWithEmployerResult> {
    const updateData: Record<string, unknown> = { status };

    if (status === 'ACTIVE') {
      updateData.publishedAt = new Date();
    } else if (status === 'CLOSED') {
      updateData.closedAt = new Date();
    }

    const prismaJob = this.prisma.job as any;
    const job = await prismaJob.update({
      where: { id },
      data: updateData,
      include: {
        employer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
            profile: true,
          },
        },
      },
    });

    return this.mapJobToResult(job);
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

  async incrementApplications(id: string): Promise<void> {
    await this.prisma.job.update({
      where: { id },
      data: { applicationsCount: { increment: 1 } },
    });
  }

  async countApplications(id: string): Promise<number> {
    return this.prisma.application.count({
      where: { jobId: id },
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
    pagination: { page: number; limit: number; sortBy?: string; sortOrder?: string }
  ): Promise<JobListResult> {
    return this.findAll({ employerId }, pagination);
  }

  async findFeaturedJobs(limit = 10): Promise<JobWithEmployerResult[]> {
    const prismaJob = this.prisma.job as any;
    const jobs = await prismaJob.findMany({
      where: {
        status: 'ACTIVE',
        featured: true,
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        employer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
            profile: true,
          },
        },
      },
    });

    return jobs.map((job: any) => this.mapJobToResult(job));
  }

  async getJobStats(jobId: string): Promise<JobStats> {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      select: {
        id: true,
        views: true,
        applicationsCount: true,
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    return {
      jobId: job.id,
      views: job.views,
      applicationsCount: job.applicationsCount,
    };
  }

  private mapJobToResult(job: any): JobWithEmployerResult {
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
      location: job.location || { type: 'Point', coordinates: [0, 0] },
      locationDetails: job.locationDetails || null,
      salaryMin: job.salaryMin ? Number(job.salaryMin) : null,
      salaryMax: job.salaryMax ? Number(job.salaryMax) : null,
      salaryCurrency: job.salaryCurrency || 'USD',
      salaryPeriod: job.salaryPeriod || 'YEARLY',
      salaryNegotiable: job.salaryNegotiable || false,
      salaryCompetitive: job.salaryCompetitive || true,
      benefits: job.benefits || {},
      applicationQuestions: job.applicationQuestions || [],
      applicationDeadline: job.applicationDeadline || null,
      startDate: job.startDate || null,
      openings: job.openings || 1,
      status: job.status,
      featured: job.featured || false,
      views: job.views || 0,
      applicationsCount: job.applicationsCount || 0,
      publishedAt: job.publishedAt || null,
      expiresAt: job.expiresAt || null,
      closedAt: job.closedAt || null,
      aiGeneratedDescription: job.aiGeneratedDescription || false,
      screeningCriteria: job.screeningCriteria || [],
      matchSettings: job.matchSettings || {},
      createdAt: new Date(job.createdAt),
      updatedAt: new Date(job.updatedAt),
      employer: job.employer || null,
    };
  }

  private buildOrderBy(sortBy?: string, sortOrder?: string): Record<string, string> {
    const validSortFields = ['createdAt', 'updatedAt', 'title', 'views', 'applicationsCount'];
    const order = sortOrder === 'asc' ? 'asc' : 'desc';

    if (sortBy && validSortFields.includes(sortBy)) {
      return { [sortBy]: order };
    }

    return { createdAt: 'desc' };
  }

  private buildSearchOrderBy(
    sortBy?: 'relevance' | 'date' | 'salary' | 'distance',
    sortOrder?: 'asc' | 'desc'
  ): Record<string, string> {
    const order = sortOrder === 'asc' ? 'asc' : 'desc';

    switch (sortBy) {
      case 'date':
        return { createdAt: order };
      case 'salary':
        return { salaryMax: order };
      case 'relevance':
      default:
        return { createdAt: 'desc' };
    }
  }
}
