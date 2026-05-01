import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserStats() {
    const [totalUsers, activeUsers, employers, jobSeekers] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { status: 'ACTIVE' } }),
      this.prisma.user.count({ where: { role: 'EMPLOYER' } }),
      this.prisma.user.count({ where: { role: 'JOB_SEEKER' } }),
    ]);

    return {
      totalUsers,
      activeUsers,
      employers,
      jobSeekers,
    };
  }

  async getJobStats() {
    const [totalJobs, activeJobs, applications] = await Promise.all([
      this.prisma.job.count(),
      this.prisma.job.count({ where: { status: 'ACTIVE' } }),
      this.prisma.application.count(),
    ]);

    return {
      totalJobs,
      activeJobs,
      applications,
    };
  }

  async getRecentActivity(days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [recentUsers, recentJobs, recentApplications] = await Promise.all([
      this.prisma.user.count({
        where: { createdAt: { gte: startDate } },
      }),
      this.prisma.job.count({
        where: { createdAt: { gte: startDate } },
      }),
      this.prisma.application.count({
        where: { submittedAt: { gte: startDate } },
      }),
    ]);

    return {
      recentUsers,
      recentJobs,
      recentApplications,
      period: `${days} days`,
    };
  }

  async getDashboardSummary() {
    const [userStats, jobStats, recentActivity] = await Promise.all([
      this.getUserStats(),
      this.getJobStats(),
      this.getRecentActivity(),
    ]);

    return {
      ...userStats,
      ...jobStats,
      ...recentActivity,
    };
  }
}