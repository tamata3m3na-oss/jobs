import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import type {
  ApplicationWithRelations,
  PaginationOptions,
  EmployerNoteData,
  InterviewData,
} from '../../repositories/interfaces/i-application.repository';
import { PrismaApplicationRepository } from '../../repositories/implementations/prisma-application.repository';
import { PrismaJobRepository } from '../../repositories/implementations/prisma-job.repository';
import {
  CreateApplicationDto,
  UpdateApplicationStatusDto,
  ApplicationResponse,
  toApplicationResponse,
  ApplicationListResponse,
  ApplicationSearchQueryDto,
  ApplicationStatsResponse,
  ScheduleInterviewDto,
  SubmitFeedbackDto,
  AddEmployerNoteDto,
  PaginationQueryDto,
} from './dto';
import type { ApplicationStatus } from '@smartjob/shared';

interface AuthenticatedRequest {
  user: {
    id: string;
    role: string;
    email: string;
  };
}

const VALID_STATUS_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  SUBMITTED: ['UNDER_REVIEW', 'WITHDRAWN'],
  UNDER_REVIEW: ['SHORTLISTED', 'REJECTED', 'WITHDRAWN'],
  SHORTLISTED: ['INTERVIEW_SCHEDULED', 'REJECTED', 'WITHDRAWN'],
  INTERVIEW_SCHEDULED: ['INTERVIEW_COMPLETED', 'REJECTED', 'WITHDRAWN'],
  INTERVIEW_COMPLETED: ['OFFER_EXTENDED', 'REJECTED', 'WITHDRAWN'],
  OFFER_EXTENDED: ['OFFER_ACCEPTED', 'OFFER_DECLINED', 'WITHDRAWN'],
  OFFER_ACCEPTED: [],
  OFFER_DECLINED: [],
  REJECTED: [],
  WITHDRAWN: [],
  EXPIRED: [],
};

interface InterviewDataInternal {
  id: string;
  scheduledAt: Date;
  duration: number;
  type: string;
  meetingLink?: string;
  location?: string;
  interviewerId: string;
  interviewerName: string;
  interviewerEmail: string;
  notes?: string;
  feedback?: {
    rating: number;
    strengths: string[];
    weaknesses: string[];
    recommendation: string;
    notes: string;
  };
  status: string;
}

@Injectable()
export class ApplicationsService {
  private readonly logger = new Logger(ApplicationsService.name);

  constructor(
    private readonly applicationRepository: PrismaApplicationRepository,
    private readonly jobRepository: PrismaJobRepository
  ) {}

  async apply(applicantId: string, data: CreateApplicationDto): Promise<ApplicationResponse> {
    const job = await this.jobRepository.findById(data.jobId);

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (job.status !== 'ACTIVE') {
      throw new BadRequestException('Job is not accepting applications');
    }

    if (job.applicationDeadline && new Date(job.applicationDeadline) < new Date()) {
      throw new BadRequestException('Application deadline has passed');
    }

    const existingApplication = await this.applicationRepository.findByJobAndApplicant(
      data.jobId,
      applicantId
    );

    if (existingApplication) {
      throw new ConflictException('You have already applied for this job');
    }

    if (job.applicationQuestions?.length > 0 && data.answers?.length > 0) {
      const requiredQuestionIds = (
        job.applicationQuestions as Array<{ id?: string; required?: boolean }>
      )
        .filter((q) => q.required)
        .map((q) => q.id);

      const answeredQuestionIds = data.answers.map((a) => a.questionId);
      const missingRequired = requiredQuestionIds.filter(
        (id) => id && !answeredQuestionIds.includes(id)
      );

      if (missingRequired.length > 0) {
        throw new BadRequestException('Please answer all required questions');
      }
    }

    const application = await this.applicationRepository.create({
      jobId: data.jobId,
      applicantId,
      employerId: job.employerId,
      answers: data.answers,
      coverLetterUrl: data.coverLetter,
      portfolioUrls: data.portfolioUrls,
      source: data.source,
    });

    await this.jobRepository.incrementApplications(data.jobId);

    this.logger.log(
      `Application created: ${application.id} for job: ${data.jobId} by applicant: ${applicantId}`
    );

    return toApplicationResponse(application);
  }

  async getApplicationById(id: string, req?: AuthenticatedRequest): Promise<ApplicationResponse> {
    const application = await this.applicationRepository.findById(id);

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (req?.user?.id && !this.canViewApplication(application, req.user)) {
      throw new ForbiddenException('You do not have permission to view this application');
    }

    return toApplicationResponse(application);
  }

  async getApplicationsForSeeker(
    seekerId: string,
    pagination: PaginationQueryDto
  ): Promise<ApplicationListResponse> {
    const paginationOptions: PaginationOptions = {
      page: pagination.page,
      limit: pagination.limit,
      sortBy: pagination.sortBy,
      sortOrder: pagination.sortOrder,
    };

    const result = await this.applicationRepository.findByApplicant(seekerId, paginationOptions);

    return {
      data: result.data.map((app) => toApplicationResponse(app)),
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
        hasNextPage: result.page < result.totalPages,
        hasPrevPage: result.page > 1,
      },
    };
  }

  async getApplicationsForJob(
    jobId: string,
    employerId: string,
    pagination: PaginationQueryDto
  ): Promise<ApplicationListResponse> {
    const job = await this.jobRepository.findById(jobId);

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (job.employerId !== employerId) {
      throw new ForbiddenException('You do not own this job');
    }

    const paginationOptions: PaginationOptions = {
      page: pagination.page,
      limit: pagination.limit,
      sortBy: pagination.sortBy,
      sortOrder: pagination.sortOrder,
    };

    const result = await this.applicationRepository.findByJob(jobId, paginationOptions);

    return {
      data: result.data.map((app) => toApplicationResponse(app)),
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
        hasNextPage: result.page < result.totalPages,
        hasPrevPage: result.page > 1,
      },
    };
  }

  async updateStatus(
    applicationId: string,
    employerId: string,
    data: UpdateApplicationStatusDto
  ): Promise<ApplicationResponse> {
    const application = await this.applicationRepository.findById(applicationId);

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.employerId !== employerId) {
      throw new ForbiddenException('You do not have permission to update this application');
    }

    if (!this.isValidTransition(application.status as ApplicationStatus, data.status)) {
      throw new BadRequestException(
        `Invalid status transition from ${application.status} to ${data.status}`
      );
    }

    const updateData: Record<string, unknown> = {
      status: data.status,
      lastActivityAt: new Date(),
    };

    if (data.status === 'REJECTED' && data.rejectionReason) {
      updateData.rejectionReason = data.rejectionReason;
    }

    if (data.notes) {
      updateData.notes = data.notes;
    }

    const updated = await this.applicationRepository.update(applicationId, updateData);

    this.logger.log(`Application ${applicationId} status updated to ${data.status}`);

    return toApplicationResponse(updated);
  }

  async withdrawApplication(
    applicationId: string,
    applicantId: string
  ): Promise<ApplicationResponse> {
    const application = await this.applicationRepository.findById(applicationId);

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.applicantId !== applicantId) {
      throw new ForbiddenException('You can only withdraw your own applications');
    }

    const currentStatus = application.status as ApplicationStatus;
    if (
      currentStatus === 'OFFER_ACCEPTED' ||
      currentStatus === 'OFFER_DECLINED' ||
      currentStatus === 'REJECTED'
    ) {
      throw new BadRequestException('Cannot withdraw an application that has been finalized');
    }

    const updated = await this.applicationRepository.updateStatus(applicationId, 'WITHDRAWN');

    this.logger.log(`Application ${applicationId} withdrawn by applicant ${applicantId}`);

    return toApplicationResponse(updated);
  }

  async scheduleInterview(
    applicationId: string,
    employerId: string,
    data: ScheduleInterviewDto
  ): Promise<ApplicationResponse> {
    const application = await this.applicationRepository.findById(applicationId);

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.employerId !== employerId) {
      throw new ForbiddenException('You do not have permission to schedule an interview');
    }

    const validStatuses: ApplicationStatus[] = [
      'SHORTLISTED',
      'INTERVIEW_SCHEDULED',
      'INTERVIEW_COMPLETED',
    ];
    if (!validStatuses.includes(application.status as ApplicationStatus)) {
      throw new BadRequestException('Cannot schedule interview for application in current status');
    }

    const interview: InterviewDataInternal = {
      id: this.generateUuid(),
      scheduledAt: new Date(data.scheduledAt),
      duration: data.duration,
      type: data.type,
      meetingLink: data.meetingLink,
      location: data.location,
      interviewerId: data.interviewerId,
      interviewerName: data.interviewerName,
      interviewerEmail: data.interviewerEmail,
      notes: data.notes,
      status: 'SCHEDULED',
    };

    const updated = await this.applicationRepository.addInterview(
      applicationId,
      interview as unknown as InterviewData
    );

    this.logger.log(`Interview scheduled for application ${applicationId}`);

    return toApplicationResponse(updated);
  }

  async completeInterview(
    applicationId: string,
    data: SubmitFeedbackDto
  ): Promise<ApplicationResponse> {
    const application = await this.applicationRepository.findById(applicationId);

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const interviews = application.interviews;
    const interview = interviews.find((i) => i.id === data.interviewId);

    if (!interview) {
      throw new BadRequestException('Interview not found');
    }

    const interviewWithFeedback = {
      ...interview,
      feedback: {
        rating: data.rating,
        strengths: data.strengths,
        weaknesses: data.weaknesses,
        recommendation: data.recommendation,
        notes: data.notes,
      },
      status: 'COMPLETED' as const,
    };

    const updatedInterviews = interviews.map((i) =>
      i.id === data.interviewId ? interviewWithFeedback : i
    );

    const updated = await this.applicationRepository.update(applicationId, {
      interviews: updatedInterviews as unknown as InterviewData[],
      status: 'INTERVIEW_COMPLETED',
      lastActivityAt: new Date(),
    });

    this.logger.log(`Interview feedback submitted for application ${applicationId}`);

    return toApplicationResponse(updated);
  }

  async addEmployerNote(
    applicationId: string,
    employerId: string,
    data: AddEmployerNoteDto,
    authorName: string
  ): Promise<ApplicationResponse> {
    const application = await this.applicationRepository.findById(applicationId);

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.employerId !== employerId) {
      throw new ForbiddenException('You do not have permission to add notes');
    }

    const note: EmployerNoteData = {
      id: this.generateUuid(),
      authorId: employerId,
      authorName,
      content: data.content,
      createdAt: new Date(),
    };

    const updated = await this.applicationRepository.addNote(applicationId, note);

    this.logger.log(`Note added to application ${applicationId}`);

    return toApplicationResponse(updated);
  }

  async getApplicationStats(jobId: string, employerId: string): Promise<ApplicationStatsResponse> {
    const job = await this.jobRepository.findById(jobId);

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (job.employerId !== employerId) {
      throw new ForbiddenException('You do not have permission to view stats');
    }

    const stats = await this.applicationRepository.getApplicationStats(jobId);

    return {
      jobId,
      totalApplications: stats.totalApplications,
      statusBreakdown: stats.statusBreakdown,
      averageMatchScore: stats.averageMatchScore,
      newApplications: stats.newApplications,
      pendingReview: stats.pendingReview,
      inInterview: stats.inInterview,
    };
  }

  async getAllApplicationsForAdmin(
    pagination: PaginationQueryDto,
    filters?: ApplicationSearchQueryDto
  ): Promise<ApplicationListResponse> {
    let result;
    if (filters) {
      result = await this.applicationRepository.search({
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
      });
    } else {
      result = await this.applicationRepository.paginate(pagination.page, pagination.limit);
    }

    return {
      data: result.data.map((app) => toApplicationResponse(app)),
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
        hasNextPage: result.page < result.totalPages,
        hasPrevPage: result.page > 1,
      },
    };
  }

  async updateStatusAsAdmin(
    applicationId: string,
    status: ApplicationStatus
  ): Promise<ApplicationResponse> {
    const application = await this.applicationRepository.findById(applicationId);

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const updated = await this.applicationRepository.updateStatus(applicationId, status);

    this.logger.log(`Application ${applicationId} status updated by admin to ${status}`);

    return toApplicationResponse(updated);
  }

  private isValidTransition(from: ApplicationStatus, to: ApplicationStatus): boolean {
    if (to === 'WITHDRAWN') {
      return true;
    }

    const validNextStatuses = VALID_STATUS_TRANSITIONS[from];
    return validNextStatuses?.includes(to) ?? false;
  }

  private canViewApplication(
    application: ApplicationWithRelations,
    user: { id: string; role: string }
  ): boolean {
    if (user.role === 'ADMIN') {
      return true;
    }

    if (application.applicantId === user.id) {
      return true;
    }

    if (application.employerId === user.id) {
      return true;
    }

    return false;
  }

  private generateUuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
