import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { USER_REPOSITORY } from '../../repositories/interfaces/i-user.repository';
import { JOB_REPOSITORY } from '../../repositories/interfaces/i-job.repository';
import type { IUserRepository } from '../../repositories/interfaces/i-user.repository';
import type { IJobRepository } from '../../repositories/interfaces/i-job.repository';
import { UserStatus, JobStatus } from '@smartjob/shared';

@Injectable()
export class AdminService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(JOB_REPOSITORY) private readonly jobRepository: IJobRepository,
    private readonly prisma: PrismaService
  ) {}

  async getUsers(page = 1, limit = 10) {
    const result = await this.userRepository.findAll({}, { page, limit });
    return {
      data: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    };
  }

  async updateUserStatus(id: string, status: UserStatus) {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return this.userRepository.update(id, { status });
  }

  async getJobs(page = 1, limit = 10) {
    const result = await this.jobRepository.findAll({}, { page, limit });
    return {
      data: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    };
  }

  async updateJobStatus(id: string, status: JobStatus) {
    const job = await this.jobRepository.findById(id);
    if (!job) throw new NotFoundException('Job not found');

    const updateData: Record<string, unknown> = { status };
    if (status === 'ACTIVE') {
      updateData.publishedAt = new Date();
    }

    return this.jobRepository.update(id, updateData as Record<string, unknown>);
  }

  async getSystemStats() {
    const totalUsers = await this.prisma.user.count();
    const totalJobs = await this.prisma.job.count();
    const pendingJobs = await this.prisma.job.count({ where: { status: 'PENDING_APPROVAL' } });

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
