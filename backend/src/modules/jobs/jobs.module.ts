import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController, JobsAdminController } from './jobs.controller';
import { PrismaJobRepository } from '../../repositories/implementations/prisma-job.repository';
import { IJobRepository } from '../../repositories/interfaces/i-job.repository';
import { CacheModule } from '../../common/cache/cache.module';

@Module({
  imports: [CacheModule],
  providers: [
    {
      provide: IJobRepository,
      useClass: PrismaJobRepository,
    },
    JobsService,
  ],
  controllers: [JobsController, JobsAdminController],
  exports: [JobsService],
})
export class JobsModule {}