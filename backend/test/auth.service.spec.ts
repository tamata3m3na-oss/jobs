import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../src/modules/auth/auth.service';
import { PrismaService } from '../src/database/prisma.service';
import { TokenService } from '../src/modules/auth/services/token.service';
import { IUserRepository } from '../src/repositories/interfaces/i-user.repository';
import { ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuditService } from '../src/modules/audit/audit.service';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: IUserRepository;
  let prisma: PrismaService;
  let tokenService: TokenService;
  let auditService: AuditService;

  const mockUser = {
    id: 'user-id',
    email: 'test@example.com',
    password: 'hashed-password',
    role: 'JOB_SEEKER',
    firstName: 'Test',
    lastName: 'User',
  };

  const mockUserRepository = {
    existsByEmail: jest.fn(),
    create: jest.fn(),
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
  };

  const mockTokenService = {
    createTokenPair: jest.fn(),
    rotateRefreshToken: jest.fn(),
    revokeAllUserTokens: jest.fn(),
  };

  const mockAuditService = {
    log: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: 'IUserRepository', useValue: mockUserRepository },
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: TokenService, useValue: mockTokenService },
        { provide: AuditService, useValue: mockAuditService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<IUserRepository>('IUserRepository');
    prisma = module.get<PrismaService>(PrismaService);
    tokenService = module.get<TokenService>(TokenService);
    auditService = module.get<AuditService>(AuditService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('registerJobSeeker', () => {
    it('should throw ConflictException if email exists', async () => {
      mockUserRepository.existsByEmail.mockResolvedValue(true);
      await expect(service.registerJobSeeker({ email: 'test@example.com' } as any)).rejects.toThrow(
        ConflictException
      );
    });

    it('should create a user and return tokens', async () => {
      mockUserRepository.existsByEmail.mockResolvedValue(false);
      mockUserRepository.create.mockResolvedValue(mockUser);
      mockTokenService.createTokenPair.mockResolvedValue({ accessToken: 'at', refreshToken: 'rt' });

      const result = await service.registerJobSeeker({
        email: 'test@example.com',
        password: 'password',
        firstName: 'Test',
        lastName: 'User',
      });

      expect(result.user.email).toEqual(mockUser.email);
      expect(result.tokens).toBeDefined();
      expect(mockAuditService.log).toHaveBeenCalled();
    });
  });

  describe('validateUser', () => {
    it('should return user if credentials are valid', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));

      const result = await service.validateUser('test@example.com', 'password');
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
      });
      expect(mockAuditService.log).toHaveBeenCalled();
    });

    it('should return null if password mismatch', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));

      const result = await service.validateUser('test@example.com', 'wrong');
      expect(result).toBeNull();
      expect(mockAuditService.log).toHaveBeenCalled();
    });
  });
});
