import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { UserEntity } from '../../database/entities/user.entity';
import { JobEntity } from '../../database/entities/job.entity';
import { ApplicationEntity } from '../../database/entities/application.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, JobEntity, ApplicationEntity])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
