import { Injectable, NotFoundException, ForbiddenException, Logger, Inject } from '@nestjs/common';
import { JOB_REPOSITORY } from '../../repositories/interfaces/i-job.repository';
import type { IJobRepository, JobFilterInput } from '../../repositories/interfaces/i-job.repository';
import { CacheService } from '../../common/cache/cache.service';
import { CreateJob, UpdateJob, JobSearchFilters, JobStatus } from '@smartjob/shared';
import { JobResponse, toJobResponse, JobSearchQueryDto, PaginationQueryDto } from './dto';

interface AuthenticatedRequest {
  user: {
    id: string;
    role: string;
    email: string;
  };
}

export interface JobListResponse {
  data: JobResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface JobDetailResponse extends JobResponse {
  isOwner?: boolean;
}

export interface JobStatsResponse {
  jobId: string;
  views: number;
  applicationsCount: number;
  status: string;
}

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);
  private readonly JOB_CACHE_TTL = 300;
  private readonly SEARCH_CACHE_TTL = 120;
  private readonly FEATURED_CACHE_TTL = 600;

  constructor(
    @Inject(JOB_REPOSITORY) private readonly jobRepository: IJobRepository,
    private readonly cacheService: CacheService
  ) {}

  async createJob(employerId: string, data: CreateJob): Promise<JobResponse> {
    const { location, ...jobData } = data;

    const slug = await this.generateUniqueSlug(data.title);

    const createInput = {
      employerId,
      title: jobData.title,
      slug,
      description: jobData.description,
      shortDescription: jobData.shortDescription,
      requirements: jobData.requirements || [],
      responsibilities: jobData.responsibilities || [],
      niceToHave: jobData.niceToHave || [],
      skills: jobData.skills || [],
      jobType: jobData.jobType,
      experienceLevel: jobData.experienceLevel || 'MID',
      location: {
        type: 'Point' as const,
        coordinates: location.coordinates,
      },
      locationDetails: {
        address: location.address,
        city: location.city,
        country: location.country,
        postalCode: location.postalCode,
        isRemote: location.isRemote,
        remoteOptions: location.remoteOptions,
        travelRequirements: location.travelRequirements,
      },
      benefits: jobData.benefits || {},
      applicationQuestions: jobData.applicationQuestions || [],
      applicationDeadline: jobData.applicationDeadline ?? null,
      startDate: jobData.startDate ?? null,
      openings: jobData.openings || 1,
      status: jobData.status || 'DRAFT',
      featured: jobData.featured || false,
      screeningCriteria: jobData.screeningCriteria || [],
      matchSettings: jobData.matchSettings || {},
      salaryMin: jobData.salary?.min ?? null,
      salaryMax: jobData.salary?.max ?? null,
      salaryCurrency: jobData.salary?.currency ?? 'USD',
      salaryPeriod: jobData.salary?.period ?? 'YEARLY',
      salaryNegotiable: jobData.salary?.negotiable ?? false,
      salaryCompetitive: jobData.salary?.competitive ?? true,
    };

    const job = await this.jobRepository.create(createInput);

    await this.cacheService.invalidateJobCache();

    return toJobResponse(job);
  }

  async getJobById(id: string, req?: AuthenticatedRequest): Promise<JobDetailResponse> {
    const cacheKey = `job:${id}`;
    const cached = await this.cacheService.get<JobResponse>(cacheKey, 'job');

    if (cached) {
      const isOwner = req?.user?.id ? cached.employerId === req.user.id : false;
      return { ...cached, isOwner };
    }

    const job = await this.jobRepository.findByIdWithEmployer(id);

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    await this.jobRepository.incrementViews(id);

    const response = toJobResponse(job);
    await this.cacheService.set(cacheKey, response, {
      ttl: this.JOB_CACHE_TTL,
      prefix: 'job',
    });

    const isOwner = req?.user?.id ? job.employerId === req.user.id : false;
    return { ...response, isOwner };
  }

  async getJobBySlug(slug: string): Promise<JobResponse> {
    const cacheKey = `job:slug:${slug}`;
    const cached = await this.cacheService.get<JobResponse>(cacheKey, 'job');

    if (cached) {
      return cached;
    }

    const job = await this.jobRepository.findBySlugWithEmployer(slug);

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    await this.jobRepository.incrementViews(job.id);

    const response = toJobResponse(job);
    await this.cacheService.set(cacheKey, response, {
      ttl: this.JOB_CACHE_TTL,
      prefix: 'job',
    });

    return response;
  }

  async updateJob(jobId: string, employerId: string, data: UpdateJob): Promise<JobResponse> {
    const existingJob = await this.jobRepository.findById(jobId);

    if (!existingJob) {
      throw new NotFoundException('Job not found');
    }

    if (existingJob.employerId !== employerId) {
      throw new ForbiddenException('You are not authorized to update this job');
    }

    const { location, ...jobData } = data;
    const updateData: Record<string, unknown> = { ...jobData };

    if (location) {
      updateData.location = {
        type: 'Point' as const,
        coordinates: location.coordinates,
      };
      updateData.locationDetails = {
        address: location.address,
        city: location.city,
        country: location.country,
        postalCode: location.postalCode,
        isRemote: location.isRemote,
        remoteOptions: location.remoteOptions,
        travelRequirements: location.travelRequirements,
      };
    }

    if (jobData.salary) {
      updateData.salaryMin = jobData.salary.min;
      updateData.salaryMax = jobData.salary.max;
      updateData.salaryCurrency = jobData.salary.currency;
      updateData.salaryPeriod = jobData.salary.period;
      updateData.salaryNegotiable = jobData.salary.negotiable;
      updateData.salaryCompetitive = jobData.salary.competitive;
      delete updateData.salary;
    }

    const updatedJob = await this.jobRepository.update(jobId, updateData);

    await this.cacheService.invalidateJobCache(jobId);

    return toJobResponse(updatedJob);
  }

  async deleteJob(jobId: string, employerId: string): Promise<void> {
    const existingJob = await this.jobRepository.findById(jobId);

    if (!existingJob) {
      throw new NotFoundException('Job not found');
    }

    if (existingJob.employerId !== employerId) {
      throw new ForbiddenException('You are not authorized to delete this job');
    }

    await this.jobRepository.delete(jobId);

    await this.cacheService.invalidateJobCache(jobId);
  }

  async searchJobs(filters: JobSearchFilters): Promise<JobListResponse> {
    const cacheKey = `search:${this.cacheService.generateSearchCacheKey(filters as unknown as Record<string, unknown>)}`;
    const cached = await this.cacheService.get<JobListResponse>(cacheKey, 'jobs');

    if (cached) {
      return cached;
    }

    const searchFilters: JobSearchFilters = {
      ...filters,
      status: filters.status || 'ACTIVE',
      page: filters.page || 1,
      limit: filters.limit || 20,
      sortBy: filters.sortBy || 'relevance',
      sortOrder: filters.sortOrder || 'desc',
    };

    const result = await this.jobRepository.search(searchFilters);

    const response: JobListResponse = {
      data: result.data.map((job) => toJobResponse(job)),
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
        hasNextPage: result.page < result.totalPages,
        hasPrevPage: result.page > 1,
      },
    };

    await this.cacheService.set(cacheKey, response, {
      ttl: this.SEARCH_CACHE_TTL,
      prefix: 'jobs',
    });

    return response;
  }

  async listEmployerJobs(
    employerId: string,
    pagination: PaginationQueryDto
  ): Promise<JobListResponse> {
    const result = await this.jobRepository.findByEmployer(employerId, {
      page: pagination.page,
      limit: pagination.limit,
      sortBy: pagination.sortBy,
      sortOrder: pagination.sortOrder,
    });

    return {
      data: result.data.map((job) => toJobResponse(job)),
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
        hasNextPage: result.page < result.totalPages,
        hasPrevPage: result.page > 1,
      },
    };
  }

  async getFeaturedJobs(): Promise<JobResponse[]> {
    const cacheKey = 'featured';
    const cached = await this.cacheService.get<JobResponse[]>(cacheKey, 'jobs');

    if (cached) {
      return cached;
    }

    const jobs = await this.jobRepository.findFeaturedJobs(10);

    const response = jobs.map((job) => toJobResponse(job));

    await this.cacheService.set(cacheKey, response, {
      ttl: this.FEATURED_CACHE_TTL,
      prefix: 'jobs',
    });

    return response;
  }

  async publishJob(jobId: string, employerId: string): Promise<JobResponse> {
    const existingJob = await this.jobRepository.findById(jobId);

    if (!existingJob) {
      throw new NotFoundException('Job not found');
    }

    if (existingJob.employerId !== employerId) {
      throw new ForbiddenException('You are not authorized to publish this job');
    }

    const updatedJob = await this.jobRepository.updateStatus(jobId, 'ACTIVE');

    await this.cacheService.invalidateJobCache(jobId);

    return toJobResponse(updatedJob);
  }

  async pauseJob(jobId: string, employerId: string): Promise<JobResponse> {
    const existingJob = await this.jobRepository.findById(jobId);

    if (!existingJob) {
      throw new NotFoundException('Job not found');
    }

    if (existingJob.employerId !== employerId) {
      throw new ForbiddenException('You are not authorized to pause this job');
    }

    const updatedJob = await this.jobRepository.updateStatus(jobId, 'PAUSED');

    await this.cacheService.invalidateJobCache(jobId);

    return toJobResponse(updatedJob);
  }

  async closeJob(jobId: string, employerId: string): Promise<JobResponse> {
    const existingJob = await this.jobRepository.findById(jobId);

    if (!existingJob) {
      throw new NotFoundException('Job not found');
    }

    if (existingJob.employerId !== employerId) {
      throw new ForbiddenException('You are not authorized to close this job');
    }

    const updatedJob = await this.jobRepository.updateStatus(jobId, 'CLOSED');

    await this.cacheService.invalidateJobCache(jobId);

    return toJobResponse(updatedJob);
  }

  async getJobStats(jobId: string, employerId: string): Promise<JobStatsResponse> {
    const existingJob = await this.jobRepository.findById(jobId);

    if (!existingJob) {
      throw new NotFoundException('Job not found');
    }

    if (existingJob.employerId !== employerId) {
      throw new ForbiddenException('You are not authorized to view stats for this job');
    }

    const stats = await this.jobRepository.getJobStats(jobId);

    return {
      ...stats,
      status: existingJob.status,
    };
  }

  async getAllJobsForAdmin(
    pagination: PaginationQueryDto,
    filters?: { status?: JobStatus; jobType?: string }
  ): Promise<JobListResponse> {
    const filterInput: JobFilterInput = {};
    if (filters?.status) filterInput.status = filters.status;
    if (filters?.jobType) filterInput.jobType = filters.jobType as JobFilterInput['jobType'];

    const result = await this.jobRepository.findAll(filterInput, {
      page: pagination.page,
      limit: pagination.limit,
      sortBy: pagination.sortBy,
      sortOrder: pagination.sortOrder,
    });

    return {
      data: result.data.map((job) => toJobResponse(job)),
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
        hasNextPage: result.page < result.totalPages,
        hasPrevPage: result.page > 1,
      },
    };
  }

  async updateJobStatusAsAdmin(jobId: string, status: JobStatus): Promise<JobResponse> {
    const existingJob = await this.jobRepository.findById(jobId);

    if (!existingJob) {
      throw new NotFoundException('Job not found');
    }

    const updatedJob = await this.jobRepository.updateStatus(jobId, status);

    await this.cacheService.invalidateJobCache(jobId);

    return toJobResponse(updatedJob);
  }

  async deleteJobAsAdmin(jobId: string): Promise<void> {
    const existingJob = await this.jobRepository.findById(jobId);

    if (!existingJob) {
      throw new NotFoundException('Job not found');
    }

    await this.jobRepository.delete(jobId);

    await this.cacheService.invalidateJobCache(jobId);
  }

  private async generateUniqueSlug(title: string): Promise<string> {
    const baseSlug = this.slugify(title);
    let slug = baseSlug;
    let counter = 1;

    while (await this.jobRepository.existsBySlug(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
