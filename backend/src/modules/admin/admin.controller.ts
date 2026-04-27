import { Controller, Get, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserStatus, JobStatus } from '@smartjob/shared';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  getUsers(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.adminService.getUsers(+page, +limit);
  }

  @Patch('users/:id/status')
  updateUserStatus(@Param('id') id: string, @Body('status') status: UserStatus) {
    return this.adminService.updateUserStatus(id, status);
  }

  @Get('jobs')
  getJobs(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.adminService.getJobs(+page, +limit);
  }

  @Patch('jobs/:id/status')
  updateJobStatus(@Param('id') id: string, @Body('status') status: JobStatus) {
    return this.adminService.updateJobStatus(id, status);
  }

  @Get('stats')
  getSystemStats() {
    return this.adminService.getSystemStats();
  }
}
