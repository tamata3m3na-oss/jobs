import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../database/entities/user.entity';
import { JobEntity } from '../../database/entities/job.entity';
import { ApplicationEntity } from '../../database/entities/application.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(JobEntity)
    private jobRepository: Repository<JobEntity>,
    @InjectRepository(ApplicationEntity)
    private applicationRepository: Repository<ApplicationEntity>,
  ) {}

  async getAdminStats() {
    const totalUsers = await this.userRepository.count();
    const totalJobs = await this.jobRepository.count();
    const totalApplications = await this.applicationRepository.count();
    
    const usersByRole = await this.userRepository
      .createQueryBuilder('user')
      .select('user.role', 'role')
      .addSelect('COUNT(*)', 'count')
      .groupBy('user.role')
      .getRawMany();

    const jobsByStatus = await this.jobRepository
      .createQueryBuilder('job')
      .select('job.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('job.status')
      .getRawMany();

    return {
      overview: { totalUsers, totalJobs, totalApplications },
      usersByRole,
      jobsByStatus,
    };
  }

  async getEmployerStats(employerId: string) {
    const jobs = await this.jobRepository.find({ where: { employerId } });

    const totalApplications = await this.applicationRepository.count({
      where: { employerId }
    });

    const applicationsByStatus = await this.applicationRepository
      .createQueryBuilder('app')
      .select('app.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('app.employerId = :employerId', { employerId })
      .groupBy('app.status')
      .getRawMany();

    const jobPerformance = await this.jobRepository
      .createQueryBuilder('job')
      .select(['job.id', 'job.title', 'job.views', 'job.applicationsCount'])
      .where('job.employerId = :employerId', { employerId })
      .getMany();

    return {
      totalJobs: jobs.length,
      totalApplications,
      applicationsByStatus,
      jobPerformance,
    };
  }
  
  async getRevenueStats() {
    return {
      totalRevenue: 15420.50,
      currency: 'USD',
      subscriptions: {
        active: 45,
        trial: 12,
        expired: 5
      },
      revenueHistory: [
        { month: 'Jan', amount: 1200 },
        { month: 'Feb', amount: 1500 },
        { month: 'Mar', amount: 1800 },
        { month: 'Apr', amount: 2100 },
        { month: 'May', amount: 2500 },
        { month: 'Jun', amount: 3200 },
      ]
    };
  }
}
