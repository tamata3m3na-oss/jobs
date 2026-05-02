import { Module } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { USER_REPOSITORY } from '../../repositories/interfaces/i-user.repository';
import { PrismaUserRepository } from '../../repositories/implementations/prisma-user.repository';
import { JOB_REPOSITORY } from '../../repositories/interfaces/i-job.repository';
import { PrismaJobRepository } from '../../repositories/implementations/prisma-job.repository';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';

@Module({
  providers: [
    PrismaService,
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
    {
      provide: JOB_REPOSITORY,
      useClass: PrismaJobRepository,
    },
    AdminService,
  ],
  controllers: [AdminController],
  exports: [AdminService],
})
export class AdminModule {}
