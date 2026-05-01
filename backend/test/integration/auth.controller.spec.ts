import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AuthController } from '../../src/modules/auth/auth.controller';
import { AuthService } from '../../src/modules/auth/auth.service';

describe('AuthController (Integration)', () => {
  let app: INestApplication;
  let authService = {
    registerJobSeeker: jest.fn(),
    login: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/auth/register/job-seeker (POST)', () => {
    const dto = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
    };
    authService.registerJobSeeker.mockResolvedValue({
      user: { id: '1', email: 'test@example.com' },
      tokens: { accessToken: 'at', refreshToken: 'rt' },
    });

    return request(app.getHttpServer())
      .post('/auth/register/job-seeker')
      .send(dto)
      .expect(201)
      .expect((res) => {
        expect(res.body.user.email).toBe(dto.email);
        expect(res.body.tokens).toBeDefined();
      });
  });
});
