import { Test, TestingModule } from '@nestjs/testing';
import { JobsService } from '../src/modules/jobs/jobs.service';
import { CacheService } from '../src/common/cache/cache.service';
import { NotFoundException } from '@nestjs/common';

describe('JobsService', () => {
  let service: JobsService;
  let jobRepository: any;
  let cacheService: CacheService;

  const mockJobRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    findByIdWithEmployer: jest.fn(),
    findBySlugWithEmployer: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    search: jest.fn(),
    findByEmployer: jest.fn(),
    findFeaturedJobs: jest.fn(),
    updateStatus: jest.fn(),
    incrementViews: jest.fn(),
    existsBySlug: jest.fn(),
  };

  const mockCacheService = {
    get: jest.fn(),
    set: jest.fn(),
    invalidateJobCache: jest.fn(),
    generateSearchCacheKey: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
        { provide: 'IJobRepository', useValue: mockJobRepository },
        { provide: CacheService, useValue: mockCacheService },
      ],
    }).compile();

    service = module.get<JobsService>(JobsService);
    jobRepository = module.get<any>('IJobRepository');
    cacheService = module.get<CacheService>(CacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getJobById', () => {
    it('should return from cache if available', async () => {
      const mockJob = { id: '1', title: 'Job' };
      mockCacheService.get.mockResolvedValue(mockJob);

      const result = await service.getJobById('1');
      expect(result).toEqual({ ...mockJob, isOwner: false });
      expect(mockJobRepository.findByIdWithEmployer).not.toHaveBeenCalled();
    });

    it('should fetch from DB and cache if not in cache', async () => {
      const mockJob = { id: '1', title: 'Job', employerId: 'e1' };
      mockCacheService.get.mockResolvedValue(null);
      mockJobRepository.findByIdWithEmployer.mockResolvedValue(mockJob);

      const result = await service.getJobById('1');
      expect(result.id).toEqual(mockJob.id);
      expect(mockCacheService.set).toHaveBeenCalled();
    });

    it('should throw NotFoundException if not found', async () => {
      mockCacheService.get.mockResolvedValue(null);
      mockJobRepository.findByIdWithEmployer.mockResolvedValue(null);
      await expect(service.getJobById('1')).rejects.toThrow(NotFoundException);
    });
  });
});
