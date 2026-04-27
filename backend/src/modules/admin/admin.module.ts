import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UserEntity } from '../../database/entities/user.entity';
import { JobEntity } from '../../database/entities/job.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, JobEntity])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
