import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ApplicationsController } from '../../src/modules/applications/applications.controller';
import { ApplicationsService } from '../../src/modules/applications/applications.service';

describe('ApplicationsController (Integration)', () => {
  let app: INestApplication;
  let applicationsService = {
    getApplicationById: jest.fn(),
    apply: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationsController],
      providers: [{ provide: ApplicationsService, useValue: applicationsService }],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/applications/:id (GET)', () => {
    const appData = { id: '1', jobId: 'j1', applicantId: 'a1' };
    applicationsService.getApplicationById.mockResolvedValue(appData);

    return request(app.getHttpServer())
      .get('/applications/1')
      .expect(200)
      .expect((res) => {
        expect(res.body.id).toBe('1');
      });
  });
});
