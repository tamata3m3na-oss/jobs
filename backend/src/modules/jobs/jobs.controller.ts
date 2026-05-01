import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  UsePipes,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  CreateJobDto,
  UpdateJobDto,
  JobSearchQueryDto,
  PaginationQueryDto,
  JobStatusUpdateDto,
} from './dto';
import { UserRole } from '@smartjob/shared';

interface AuthenticatedRequest {
  user: {
    id: string;
    role: string;
    email: string;
  };
}

@ApiTags('Jobs')
@Controller('jobs')
export class JobsController {
  constructor(private jobsService: JobsService) {}

  @Get()
  @ApiOperation({ summary: 'Search and list jobs with filters' })
  @ApiResponse({ status: 200, description: 'Jobs retrieved successfully' })
  @ApiQuery({ name: 'query', required: false, description: 'Search query' })
  @ApiQuery({ name: 'jobTypes', required: false, description: 'Job types filter' })
  @ApiQuery({ name: 'experienceLevels', required: false, description: 'Experience levels filter' })
  @ApiQuery({ name: 'salaryMin', required: false, description: 'Minimum salary' })
  @ApiQuery({ name: 'salaryMax', required: false, description: 'Maximum salary' })
  @ApiQuery({ name: 'postedWithin', required: false, description: 'Posted within timeframe' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Sort by field' })
  @ApiQuery({ name: 'sortOrder', required: false, description: 'Sort order' })
  async searchJobs(@Query(new ZodValidationPipe(JobSearchQueryDto)) filters: JobSearchQueryDto) {
    return this.jobsService.searchJobs(filters);
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured jobs' })
  @ApiResponse({ status: 200, description: 'Featured jobs retrieved successfully' })
  async getFeaturedJobs() {
    return this.jobsService.getFeaturedJobs();
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get job by slug (SEO-friendly)' })
  @ApiResponse({ status: 200, description: 'Job retrieved successfully' })
  @ApiParam({ name: 'slug', description: 'Job slug URL identifier' })
  async getJobBySlug(@Param('slug') slug: string) {
    return this.jobsService.getJobBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get job by ID' })
  @ApiResponse({ status: 200, description: 'Job retrieved successfully' })
  @ApiParam({ name: 'id', description: 'Job UUID' })
  async getJobById(@Param('id') id: string, @Request() req?: AuthenticatedRequest) {
    return this.jobsService.getJobById(id, req);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UsePipes(new ZodValidationPipe(CreateJobDto))
  @ApiOperation({ summary: 'Create a new job' })
  @ApiResponse({ status: 201, description: 'Job created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createJob(@Request() req: AuthenticatedRequest, @Body() data: CreateJobDto) {
    return this.jobsService.createJob(req.user.id, data);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UsePipes(new ZodValidationPipe(UpdateJobDto))
  @ApiOperation({ summary: 'Update a job (owner only)' })
  @ApiResponse({ status: 200, description: 'Job updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not the job owner' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  @ApiParam({ name: 'id', description: 'Job UUID' })
  async updateJob(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
    @Body() data: UpdateJobDto
  ) {
    return this.jobsService.updateJob(id, req.user.id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a job (owner only)' })
  @ApiResponse({ status: 200, description: 'Job deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not the job owner' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  @ApiParam({ name: 'id', description: 'Job UUID' })
  async deleteJob(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    await this.jobsService.deleteJob(id, req.user.id);
    return { message: 'Job deleted successfully' };
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UsePipes(new ZodValidationPipe(JobStatusUpdateDto))
  @ApiOperation({ summary: 'Update job status (publish/pause/close)' })
  @ApiResponse({ status: 200, description: 'Job status updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not the job owner' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  @ApiParam({ name: 'id', description: 'Job UUID' })
  async updateJobStatus(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
    @Body('status') status: 'DRAFT' | 'PENDING_APPROVAL' | 'ACTIVE' | 'PAUSED' | 'CLOSED'
  ) {
    if (status === 'ACTIVE') {
      return this.jobsService.publishJob(id, req.user.id);
    } else if (status === 'CLOSED') {
      return this.jobsService.closeJob(id, req.user.id);
    } else if (status === 'PAUSED') {
      return this.jobsService.pauseJob(id, req.user.id);
    }

    return this.jobsService.updateJob(id, req.user.id, { status });
  }

  @Get('my/jobs')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get employer's own jobs" })
  @ApiResponse({ status: 200, description: 'Jobs retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyJobs(
    @Request() req: AuthenticatedRequest,
    @Query(new ZodValidationPipe(PaginationQueryDto)) pagination: PaginationQueryDto
  ) {
    return this.jobsService.listEmployerJobs(req.user.id, pagination);
  }

  @Get(':id/stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get job statistics' })
  @ApiResponse({ status: 200, description: 'Job statistics retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not the job owner' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  @ApiParam({ name: 'id', description: 'Job UUID' })
  async getJobStats(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.jobsService.getJobStats(id, req.user.id);
  }
}

@ApiTags('Admin - Jobs')
@Controller('admin/jobs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
export class JobsAdminController {
  constructor(private jobsService: JobsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all jobs with filters (Admin)' })
  @ApiResponse({ status: 200, description: 'Jobs retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async getAllJobs(
    @Query(new ZodValidationPipe(PaginationQueryDto)) pagination: PaginationQueryDto,
    @Query('status') status?: string,
    @Query('jobType') jobType?: string
  ) {
    const filters = {
      status: status as
        | 'DRAFT'
        | 'PENDING_APPROVAL'
        | 'ACTIVE'
        | 'PAUSED'
        | 'EXPIRED'
        | 'CLOSED'
        | 'REJECTED'
        | undefined,
      jobType,
    };
    return this.jobsService.getAllJobsForAdmin(pagination, filters);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Override job status (Admin)' })
  @ApiResponse({ status: 200, description: 'Job status updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  @ApiParam({ name: 'id', description: 'Job UUID' })
  async updateJobStatusAsAdmin(
    @Param('id') id: string,
    @Body('status') status: 'DRAFT' | 'PENDING_APPROVAL' | 'ACTIVE' | 'PAUSED' | 'CLOSED'
  ) {
    return this.jobsService.updateJobStatusAsAdmin(id, status);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete job (Admin)' })
  @ApiResponse({ status: 200, description: 'Job deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  @ApiParam({ name: 'id', description: 'Job UUID' })
  async deleteJobAsAdmin(@Param('id') id: string) {
    await this.jobsService.deleteJobAsAdmin(id);
    return { message: 'Job deleted successfully' };
  }
}
