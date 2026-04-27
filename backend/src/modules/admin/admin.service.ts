import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../database/entities/user.entity';
import { JobEntity } from '../../database/entities/job.entity';
import { UserStatus, JobStatus } from '@smartjob/shared';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(JobEntity)
    private jobRepository: Repository<JobEntity>,
  ) {}

  async getUsers(page = 1, limit = 10) {
    const [data, total] = await this.userRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateUserStatus(id: string, status: UserStatus) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    user.status = status;
    return this.userRepository.save(user);
  }

  async getJobs(page = 1, limit = 10) {
    const [data, total] = await this.jobRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateJobStatus(id: string, status: JobStatus) {
    const job = await this.jobRepository.findOne({ where: { id } });
    if (!job) throw new NotFoundException('Job not found');
    job.status = status;
    if (status === 'ACTIVE' && !job.publishedAt) {
      job.publishedAt = new Date();
    }
    return this.jobRepository.save(job);
  }

  async getSystemStats() {
    const totalUsers = await this.userRepository.count();
    const totalJobs = await this.jobRepository.count();
    const pendingJobs = await this.jobRepository.count({ where: { status: 'PENDING_APPROVAL' as JobStatus } });
    
    return {
      totalUsers,
      totalJobs,
      pendingJobs,
      systemHealth: 'healthy',
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
    };
  }
}
