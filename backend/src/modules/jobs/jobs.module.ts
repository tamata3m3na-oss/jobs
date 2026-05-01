import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { PrismaJobRepository } from '../repositories/implementations/prisma-job.repository';
import { IJobRepository } from '../repositories/interfaces/i-job.repository';

@Module({
  providers: [
    {
      provide: IJobRepository,
      useClass: PrismaJobRepository,
    },
    JobsService,
  ],
  controllers: [JobsController],
  exports: [JobsService],
})
export class JobsModule {}