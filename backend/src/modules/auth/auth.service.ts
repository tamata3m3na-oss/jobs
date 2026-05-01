import {
  Injectable,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service';
import { IUserRepository } from '../../repositories/interfaces/i-user.repository';
import {
  RegisterJobSeeker,
  RegisterEmployer,
  UserRole,
} from '@smartjob/shared';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async registerJobSeeker(data: RegisterJobSeeker): Promise<Record<string, unknown>> {
    const exists = await this.userRepository.existsByEmail(data.email);
    if (exists) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const profile = {
      skills: [],
      experience: [],
      education: [],
      languages: [],
      preferredJobTypes: [],
      preferredLocations: [],
    };

    return this.userRepository.create({
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      role: 'JOB_SEEKER' as UserRole,
      phone: data.phone ?? null,
      profile: profile,
    });
  }

  async registerEmployer(data: RegisterEmployer): Promise<Record<string, unknown>> {
    const exists = await this.userRepository.existsByEmail(data.email);
    if (exists) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
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

    return this.userRepository.create({
      email: userData.email,
      password: hashedPassword,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: 'EMPLOYER' as UserRole,
      phone: userData.phone ?? null,
      profile: profile,
    });
  }

  async validateUser(email: string, pass: string): Promise<Record<string, unknown> | null> {
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
        createdAt: true,
        updatedAt: true,
        phone: true,
        avatarUrl: true,
        verifiedAt: true,
        profile: true,
      },
    });

    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password: _password, ...result } = user;
      return result as Record<string, unknown>;
    }
    return null;
  }

  async login(user: Record<string, unknown>) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }
}