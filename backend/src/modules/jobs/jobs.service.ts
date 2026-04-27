import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobEntity } from '../../database/entities/job.entity';
import {
  CreateJob,
  UpdateJob,
  JobSearchFilters,
  JobStatus,
} from '@smartjob/shared';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(JobEntity)
    private jobRepository: Repository<JobEntity>,
  ) {}

  async create(employerId: string, data: CreateJob): Promise<JobEntity> {
    const { location, ...jobData } = data;
    
    const slug = this.generateSlug(data.title);
    
    const job = {
      ...jobData,
      employerId,
      slug,
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
    };

    return this.jobRepository.save(job);
  }

  async findAll(filters: JobSearchFilters): Promise<{ data: JobEntity[], total: number }> {
    const queryBuilder = this.jobRepository.createQueryBuilder('job');

    if (filters.status) {
      queryBuilder.andWhere('job.status = :status', { status: filters.status });
    } else {
      queryBuilder.andWhere('job.status = :status', { status: 'ACTIVE' as JobStatus });
    }

    if (filters.query) {
      queryBuilder.andWhere(
        '(job.title ILIKE :q OR job.description ILIKE :q OR job.skills @> :skills)',
        { 
          q: `%${filters.query}%`,
          skills: JSON.stringify([filters.query])
        },
      );
    }

    if (filters.location) {
      const { coordinates } = filters.location;
      const radius = filters.radius * 1000; // km to m

      queryBuilder.andWhere(
        'ST_DWithin(job.location, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography, :radius)',
        {
          lng: coordinates[0],
          lat: coordinates[1],
          radius,
        },
      );

      queryBuilder.addSelect(
        'ST_Distance(job.location, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography)',
        'distance',
      );
      
      if (filters.sortBy === 'distance') {
        queryBuilder.orderBy('distance', filters.sortOrder === 'asc' ? 'ASC' : 'DESC');
      }
    }

    if (filters.jobTypes && filters.jobTypes.length > 0) {
      queryBuilder.andWhere('job.jobType IN (:...jobTypes)', { jobTypes: filters.jobTypes });
    }

    if (filters.experienceLevels && filters.experienceLevels.length > 0) {
      queryBuilder.andWhere('job.experienceLevel IN (:...levels)', { levels: filters.experienceLevels });
    }

    if (filters.salaryMin) {
      queryBuilder.andWhere("(job.salary->>'min')::numeric >= :salaryMin", { salaryMin: filters.salaryMin });
    }

    if (filters.salaryMax) {
      queryBuilder.andWhere("(job.salary->>'max')::numeric <= :salaryMax", { salaryMax: filters.salaryMax });
    }

    if (filters.sortBy && filters.sortBy !== 'distance') {
        const sortField = filters.sortBy === 'date' ? 'createdAt' : 'title';
        queryBuilder.orderBy(`job.${sortField}`, filters.sortOrder === 'asc' ? 'ASC' : 'DESC');
    }

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    queryBuilder.skip((page - 1) * limit).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();
    return { data, total };
  }

  async findOne(id: string): Promise<JobEntity> {
    const job = await this.jobRepository.findOne({ where: { id } });
    if (!job) {
      throw new NotFoundException('Job not found');
    }
    return job;
  }

  async update(id: string, employerId: string, data: UpdateJob): Promise<JobEntity> {
    const job = await this.findOne(id);
    if (job.employerId !== employerId) {
        throw new Error('Unauthorized to update this job');
    }

    const { location, ...jobData } = data;

    if (location) {
        job.location = {
            type: 'Point',
            coordinates: location.coordinates,
        };
        job.locationDetails = {
            ...job.locationDetails,
            address: location.address,
            city: location.city,
            country: location.country,
            postalCode: location.postalCode,
            isRemote: location.isRemote,
            remoteOptions: location.remoteOptions,
            travelRequirements: location.travelRequirements,
        };
    }

    Object.assign(job, jobData);
    return this.jobRepository.save(job);
  }

  async remove(id: string, employerId: string): Promise<void> {
    const job = await this.findOne(id);
    if (job.employerId !== employerId) {
        throw new Error('Unauthorized to delete this job');
    }
    await this.jobRepository.remove(job);
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-') + '-' + Math.random().toString(36).substring(2, 7);
  }
}
