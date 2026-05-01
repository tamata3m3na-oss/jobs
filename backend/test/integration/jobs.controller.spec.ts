import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { JobsController } from '../../src/modules/jobs/jobs.controller';
import { JobsService } from '../../src/modules/jobs/jobs.service';

describe('JobsController (Integration)', () => {
  let app: INestApplication;
  let jobsService = {
    getJobById: jest.fn(),
    searchJobs: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [JobsController],
      providers: [{ provide: JobsService, useValue: jobsService }],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/jobs/:id (GET)', () => {
    const job = { id: '1', title: 'Job Title' };
    jobsService.getJobById.mockResolvedValue(job);

    return request(app.getHttpServer())
      .get('/jobs/1')
      .expect(200)
      .expect((res) => {
        expect(res.body.id).toBe('1');
        expect(res.body.title).toBe('Job Title');
      });
  });
});
