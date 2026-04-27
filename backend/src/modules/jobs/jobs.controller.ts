import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  UsePipes,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  CreateJobSchema,
  UpdateJobSchema,
  JobSearchFiltersSchema,
  CreateJob,
  UpdateJob,
  JobSearchFilters,
  UserRole,
} from '@smartjob/shared';

@ApiTags('Jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EMPLOYER' as UserRole, 'ADMIN' as UserRole)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new job posting' })
  @ApiResponse({ status: 201, description: 'Job created' })
  @UsePipes(new ZodValidationPipe(CreateJobSchema))
  async create(@Request() req: { user: { id: string } }, @Body() createJobDto: CreateJob) {
    return this.jobsService.create(req.user.id, createJobDto);
  }

  @Get()
  @ApiOperation({ summary: 'Search jobs' })
  @ApiResponse({ status: 200, description: 'Return jobs list' })
  async findAll(@Query() filters: JobSearchFilters) {
    const result = JobSearchFiltersSchema.safeParse(filters);
    return this.jobsService.findAll(result.success ? result.data : filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get job by ID' })
  @ApiResponse({ status: 200, description: 'Return job details' })
  async findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EMPLOYER' as UserRole, 'ADMIN' as UserRole)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update job posting' })
  @ApiResponse({ status: 200, description: 'Job updated' })
  @UsePipes(new ZodValidationPipe(UpdateJobSchema))
  async update(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
    @Body() updateJobDto: UpdateJob,
  ) {
    return this.jobsService.update(id, req.user.id, updateJobDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EMPLOYER' as UserRole, 'ADMIN' as UserRole)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete job posting' })
  @ApiResponse({ status: 204, description: 'Job deleted' })
  async remove(@Param('id') id: string, @Request() req: { user: { id: string } }) {
    return this.jobsService.remove(id, req.user.id);
  }
}
