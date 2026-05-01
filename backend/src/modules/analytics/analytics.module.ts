import { Module } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';

@Module({
  providers: [PrismaService, AnalyticsService],
  controllers: [AnalyticsController],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
