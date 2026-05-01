import {
  Controller,
  Get,
  Post,
  Patch,
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
import { ApplicationsService } from './applications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  CreateApplicationDto,
  UpdateApplicationStatusDto,
  ApplicationSearchQueryDto,
  ScheduleInterviewDto,
  SubmitFeedbackDto,
  AddEmployerNoteDto,
  PaginationQueryDto,
} from './dto';
import { UserRole } from '@smartjob/shared';

interface AuthenticatedRequest {
  user: {
    id: string;
    role: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
}

@ApiTags('Applications')
@Controller('applications')
export class ApplicationsController {
  constructor(private applicationsService: ApplicationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UsePipes(new ZodValidationPipe(CreateApplicationDto))
  @ApiOperation({ summary: 'Apply for a job' })
  @ApiResponse({ status: 201, description: 'Application submitted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  @ApiResponse({ status: 409, description: 'Already applied for this job' })
  async apply(@Request() req: AuthenticatedRequest, @Body() data: CreateApplicationDto) {
    return this.applicationsService.apply(req.user.id, data);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my applications' })
  @ApiResponse({ status: 200, description: 'Applications retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyApplications(
    @Request() req: AuthenticatedRequest,
    @Query(new ZodValidationPipe(PaginationQueryDto)) pagination: PaginationQueryDto
  ) {
    return this.applicationsService.getApplicationsForSeeker(req.user.id, pagination);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get application by ID' })
  @ApiResponse({ status: 200, description: 'Application retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  @ApiParam({ name: 'id', description: 'Application UUID' })
  async getApplicationById(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.applicationsService.getApplicationById(id, req);
  }

  @Post(':id/withdraw')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Withdraw application' })
  @ApiResponse({ status: 200, description: 'Application withdrawn successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  @ApiParam({ name: 'id', description: 'Application UUID' })
  async withdrawApplication(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.applicationsService.withdrawApplication(id, req.user.id);
  }
}

@ApiTags('Employer - Applications')
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('EMPLOYER')
@ApiBearerAuth()
export class ApplicationsEmployerController {
  constructor(private applicationsService: ApplicationsService) {}

  @Get('applications/job/:jobId')
  @ApiOperation({ summary: 'Get applications for a job (employer)' })
  @ApiResponse({ status: 200, description: 'Applications retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  @ApiParam({ name: 'jobId', description: 'Job UUID' })
  async getApplicationsForJob(
    @Param('jobId') jobId: string,
    @Request() req: AuthenticatedRequest,
    @Query(new ZodValidationPipe(PaginationQueryDto)) pagination: PaginationQueryDto
  ) {
    return this.applicationsService.getApplicationsForJob(jobId, req.user.id, pagination);
  }

  @Patch('applications/:id/status')
  @UsePipes(new ZodValidationPipe(UpdateApplicationStatusDto))
  @ApiOperation({ summary: 'Update application status' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiParam({ name: 'id', description: 'Application UUID' })
  async updateStatus(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
    @Body() data: UpdateApplicationStatusDto
  ) {
    return this.applicationsService.updateStatus(id, req.user.id, data);
  }

  @Post('applications/:id/interview')
  @UsePipes(new ZodValidationPipe(ScheduleInterviewDto))
  @ApiOperation({ summary: 'Schedule interview' })
  @ApiResponse({ status: 201, description: 'Interview scheduled successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  @ApiResponse({ status: 400, description: 'Invalid status for scheduling' })
  @ApiParam({ name: 'id', description: 'Application UUID' })
  async scheduleInterview(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
    @Body() data: ScheduleInterviewDto
  ) {
    return this.applicationsService.scheduleInterview(id, req.user.id, data);
  }

  @Post('applications/:id/feedback')
  @UsePipes(new ZodValidationPipe(SubmitFeedbackDto))
  @ApiOperation({ summary: 'Submit interview feedback' })
  @ApiResponse({ status: 200, description: 'Feedback submitted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Application or interview not found' })
  @ApiParam({ name: 'id', description: 'Application UUID' })
  async submitFeedback(@Param('id') id: string, @Body() data: SubmitFeedbackDto) {
    return this.applicationsService.completeInterview(id, data);
  }

  @Post('applications/:id/notes')
  @UsePipes(new ZodValidationPipe(AddEmployerNoteDto))
  @ApiOperation({ summary: 'Add employer notes' })
  @ApiResponse({ status: 200, description: 'Note added successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  @ApiParam({ name: 'id', description: 'Application UUID' })
  async addNote(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
    @Body() data: AddEmployerNoteDto
  ) {
    const authorName =
      `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || req.user.email;
    return this.applicationsService.addEmployerNote(id, req.user.id, data, authorName);
  }

  @Get('applications/:id/stats')
  @ApiOperation({ summary: 'Get application statistics for a job' })
  @ApiResponse({ status: 200, description: 'Stats retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  @ApiParam({ name: 'id', description: 'Job UUID' })
  async getJobApplicationStats(@Param('id') jobId: string, @Request() req: AuthenticatedRequest) {
    return this.applicationsService.getApplicationStats(jobId, req.user.id);
  }
}

@ApiTags('Admin - Applications')
@Controller('admin/applications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
export class ApplicationsAdminController {
  constructor(private applicationsService: ApplicationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all applications with filters (Admin)' })
  @ApiResponse({ status: 200, description: 'Applications retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getAllApplications(
    @Query(new ZodValidationPipe(PaginationQueryDto)) pagination: PaginationQueryDto,
    @Query(new ZodValidationPipe(ApplicationSearchQueryDto)) filters?: ApplicationSearchQueryDto
  ) {
    return this.applicationsService.getAllApplicationsForAdmin(pagination, filters);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Override application status (Admin)' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  @ApiParam({ name: 'id', description: 'Application UUID' })
  async updateStatusAsAdmin(
    @Param('id') id: string,
    @Body('status')
    status:
      | 'SUBMITTED'
      | 'UNDER_REVIEW'
      | 'SHORTLISTED'
      | 'INTERVIEW_SCHEDULED'
      | 'INTERVIEW_COMPLETED'
      | 'OFFER_EXTENDED'
      | 'OFFER_ACCEPTED'
      | 'OFFER_DECLINED'
      | 'REJECTED'
      | 'WITHDRAWN'
      | 'EXPIRED'
  ) {
    return this.applicationsService.updateStatusAsAdmin(id, status);
  }
}
