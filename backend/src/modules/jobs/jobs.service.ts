import { Injectable, NotFoundException } from '@nestjs/common';
import { IJobRepository } from '../../repositories/interfaces/i-job.repository';
import {
  CreateJob,
  UpdateJob,
  JobSearchFilters,
} from '@smartjob/shared';

@Injectable()
export class JobsService {
  constructor(
    private readonly jobRepository: IJobRepository,
  ) {}

  async create(employerId: string, data: CreateJob): Promise<Record<string, unknown>> {
    const { location, ...jobData } = data;

    const slug = this.generateSlug(data.title);

    return this.jobRepository.create({
      employerId,
      title: jobData.title,
      slug,
      description: jobData.description,
      shortDescription: jobData.shortDescription,
      requirements: jobData.requirements,
      responsibilities: jobData.responsibilities,
      niceToHave: jobData.niceToHave,
      skills: jobData.skills,
      jobType: jobData.jobType,
      experienceLevel: jobData.experienceLevel,
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
      benefits: jobData.benefits,
      applicationQuestions: jobData.applicationQuestions,
      applicationDeadline: jobData.applicationDeadline ?? null,
      startDate: jobData.startDate ?? null,
      openings: jobData.openings,
      status: jobData.status,
      featured: jobData.featured,
      screeningCriteria: jobData.screeningCriteria,
      matchSettings: jobData.matchSettings,
      salaryMin: jobData.salary?.min ?? null,
      salaryMax: jobData.salary?.max ?? null,
      salaryCurrency: jobData.salary?.currency ?? null,
      salaryPeriod: jobData.salary?.period ?? null,
      salaryNegotiable: jobData.salary?.negotiable,
      salaryCompetitive: jobData.salary?.competitive,
    });
  }

  async findAll(filters: JobSearchFilters): Promise<{ data: Record<string, unknown>[], total: number }> {
    const result = await this.jobRepository.search(filters);
    return { data: result.data, total: result.total };
  }

  async findOne(id: string): Promise<Record<string, unknown>> {
    const job = await this.jobRepository.findById(id);
    if (!job) {
      throw new NotFoundException('Job not found');
    }
    return job;
  }

  async update(id: string, employerId: string, data: UpdateJob): Promise<Record<string, unknown>> {
    const job = await this.findOne(id);
    if ((job as Record<string, unknown>).employerId !== employerId) {
      throw new Error('Unauthorized to update this job');
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

    return this.jobRepository.update(id, updateData as UpdateJob);
  }

  async remove(id: string, employerId: string): Promise<void> {
    const job = await this.findOne(id);
    if ((job as Record<string, unknown>).employerId !== employerId) {
      throw new Error('Unauthorized to delete this job');
    }
    await this.jobRepository.delete(id);
  }

  private generateSlug(title: string): string {
    return (
      title
        .toLowerCase()
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-') +
      '-' +
      Math.random().toString(36).substring(2, 7)
    );
  }
}