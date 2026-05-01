import { Module } from '@nestjs/common';
import {
  ApplicationsController,
  ApplicationsEmployerController,
  ApplicationsAdminController,
} from './applications.controller';
import { ApplicationsService } from './applications.service';
import { PrismaApplicationRepository } from '../../repositories/implementations/prisma-application.repository';
import { PrismaJobRepository } from '../../repositories/implementations/prisma-job.repository';

@Module({
  controllers: [
    ApplicationsController,
    ApplicationsEmployerController,
    ApplicationsAdminController,
  ],
  providers: [ApplicationsService, PrismaApplicationRepository, PrismaJobRepository],
  exports: [ApplicationsService],
})
export class ApplicationsModule {}
