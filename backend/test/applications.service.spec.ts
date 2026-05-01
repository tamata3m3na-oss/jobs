import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationsService } from '../src/modules/applications/applications.service';
import { PrismaApplicationRepository } from '../src/repositories/implementations/prisma-application.repository';
import { PrismaJobRepository } from '../src/repositories/implementations/prisma-job.repository';
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';

describe('ApplicationsService', () => {
  let service: ApplicationsService;
  let applicationRepository: any;
  let jobRepository: any;

  const mockApplicationRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    findByJobAndApplicant: jest.fn(),
    findByApplicant: jest.fn(),
    findByJob: jest.fn(),
    update: jest.fn(),
    updateStatus: jest.fn(),
    addInterview: jest.fn(),
    addNote: jest.fn(),
    getApplicationStats: jest.fn(),
    paginate: jest.fn(),
    search: jest.fn(),
  };

  const mockJobRepository = {
    findById: jest.fn(),
    incrementApplications: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationsService,
        { provide: PrismaApplicationRepository, useValue: mockApplicationRepository },
        { provide: PrismaJobRepository, useValue: mockJobRepository },
      ],
    }).compile();

    service = module.get<ApplicationsService>(ApplicationsService);
    applicationRepository = module.get<any>(PrismaApplicationRepository);
    jobRepository = module.get<any>(PrismaJobRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('apply', () => {
    it('should create an application if all checks pass', async () => {
      const mockJob = { id: 'j1', status: 'ACTIVE', employerId: 'e1', applicationQuestions: [] };
      const dto = { jobId: 'j1' };
      const applicantId = 'a1';
      const mockApp = { id: 'app1', jobId: 'j1', applicantId, employerId: 'e1', status: 'SUBMITTED' };

      mockJobRepository.findById.mockResolvedValue(mockJob);
      mockApplicationRepository.findByJobAndApplicant.mockResolvedValue(null);
      mockApplicationRepository.create.mockResolvedValue(mockApp);

      const result = await service.apply(applicantId, dto as any);
      expect(result.id).toEqual(mockApp.id);
      expect(mockJobRepository.incrementApplications).toHaveBeenCalledWith('j1');
    });

    it('should throw NotFoundException if job not found', async () => {
      mockJobRepository.findById.mockResolvedValue(null);
      await expect(service.apply('a1', { jobId: 'j1' } as any)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if job is not active', async () => {
      mockJobRepository.findById.mockResolvedValue({ status: 'DRAFT' });
      await expect(service.apply('a1', { jobId: 'j1' } as any)).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if already applied', async () => {
      mockJobRepository.findById.mockResolvedValue({ status: 'ACTIVE' });
      mockApplicationRepository.findByJobAndApplicant.mockResolvedValue({ id: 'existing' });
      await expect(service.apply('a1', { jobId: 'j1' } as any)).rejects.toThrow(ConflictException);
    });
  });
});
