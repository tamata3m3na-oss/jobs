import * as shared from '@smartjob/shared';
import type { IUserRepository } from '../../repositories/interfaces/i-user.repository';
import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service';
import { TokenService, TokenPair } from './services/token.service';
import { AuditService, AuditEvent } from '../audit/audit.service';

type RegisterJobSeeker = shared.RegisterJobSeeker;
type RegisterEmployer = shared.RegisterEmployer;
type UserRole = shared.UserRole;
type AuthTokens = shared.AuthTokens;

const BCRYPT_SALT_ROUNDS = 12;

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  user: AuthenticatedUser;
  tokens: AuthTokens;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    private readonly auditService: AuditService
  ) {}

  async registerJobSeeker(data: RegisterJobSeeker): Promise<AuthResponse> {
    const exists = await this.userRepository.existsByEmail(data.email);
    if (exists) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, BCRYPT_SALT_ROUNDS);
    const profile = {
      skills: [],
      experience: [],
      education: [],
      languages: [],
      preferredJobTypes: [],
      preferredLocations: [],
    };

    const user = await this.userRepository.create({
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      role: 'JOB_SEEKER' as UserRole,
      phone: data.phone ?? null,
      profile: profile,
    });

    const tokens = await this.tokenService.createTokenPair(
      user.id as string,
      user.email as string,
      user.role as UserRole
    );

    await this.auditService.log({
      entityType: 'User',
      entityId: user.id as string,
      action: AuditEvent.REGISTER_SUCCESS,
      userId: user.id as string,
      userEmail: user.email as string,
      metadata: { role: 'JOB_SEEKER' },
    });

    return {
      user: {
        id: user.id as string,
        email: user.email as string,
        role: user.role as UserRole,
        firstName: user.firstName as string,
        lastName: user.lastName as string,
      },
      tokens,
    };
  }

  async registerEmployer(data: RegisterEmployer): Promise<AuthResponse> {
    const exists = await this.userRepository.existsByEmail(data.email);
    if (exists) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, BCRYPT_SALT_ROUNDS);
    const { companyName, companySize, companyType, industry, headquarters, ...userData } = data;

    const profile = {
      companyName,
      companySize,
      companyType,
      industry,
      headquarters,
      description: '',
      branches: [],
      verified: false,
    };

    const user = await this.userRepository.create({
      email: userData.email,
      password: hashedPassword,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: 'EMPLOYER' as UserRole,
      phone: userData.phone ?? null,
      profile: profile,
    });

    const tokens = await this.tokenService.createTokenPair(
      user.id as string,
      user.email as string,
      user.role as UserRole
    );

    await this.auditService.log({
      entityType: 'User',
      entityId: user.id as string,
      action: AuditEvent.REGISTER_SUCCESS,
      userId: user.id as string,
      userEmail: user.email as string,
      metadata: { role: 'EMPLOYER' },
    });

    return {
      user: {
        id: user.id as string,
        email: user.email as string,
        role: user.role as UserRole,
        firstName: user.firstName as string,
        lastName: user.lastName as string,
      },
      tokens,
    };
  }

  async validateUser(email: string, pass: string): Promise<AuthenticatedUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        firstName: true,
        lastName: true,
        status: true,
      },
    });

    if (user && (await bcrypt.compare(pass, user.password))) {
      await this.auditService.log({
        entityType: 'User',
        entityId: user.id,
        action: AuditEvent.LOGIN_SUCCESS,
        userId: user.id,
        userEmail: user.email,
      });
      return {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      };
    }

    await this.auditService.log({
      entityType: 'User',
      entityId: 'unknown',
      action: AuditEvent.LOGIN_FAILED,
      userEmail: email,
    });

    return null;
  }

  async login(user: AuthenticatedUser): Promise<AuthResponse> {
    const tokens = await this.tokenService.createTokenPair(user.id, user.email, user.role);

    return {
      user,
      tokens,
    };
  }

  async refreshTokens(refreshToken: string): Promise<TokenPair> {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }

    try {
      const payload = await this.tokenService.verifyRefreshToken(refreshToken);
      const newTokens = await this.tokenService.rotateRefreshToken(payload.sub, refreshToken);
      await this.auditService.log({
        entityType: 'Token',
        entityId: payload.sub,
        action: AuditEvent.REFRESH_TOKEN_SUCCESS,
        userId: payload.sub,
      });
      return newTokens;
    } catch {
      await this.auditService.log({
        entityType: 'Token',
        entityId: 'unknown',
        action: AuditEvent.REFRESH_TOKEN_FAILED,
      });
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string): Promise<void> {
    await this.tokenService.revokeAllUserTokens(userId);
    await this.auditService.log({
      entityType: 'User',
      entityId: userId,
      action: AuditEvent.LOGOUT,
      userId: userId,
    });
  }

  async getUserById(userId: string): Promise<AuthenticatedUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }
}
