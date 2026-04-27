import {
  Injectable,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '../../database/entities/user.entity';
import {
  RegisterJobSeeker,
  RegisterEmployer,
  UserRole,
} from '@smartjob/shared';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private jwtService: JwtService,
  ) {}

  async registerJobSeeker(data: RegisterJobSeeker): Promise<UserEntity> {
    const existingUser = await this.userRepository.findOne({
      where: { email: data.email },
    });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = {
      ...data,
      password: hashedPassword,
      role: 'JOB_SEEKER' as UserRole,
      profile: {
        skills: [],
        experience: [],
        education: [],
        languages: [],
        preferredJobTypes: [],
        preferredLocations: [],
      },
    };

    return this.userRepository.save(user);
  }

  async registerEmployer(data: RegisterEmployer): Promise<UserEntity> {
    const existingUser = await this.userRepository.findOne({
      where: { email: data.email },
    });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const { companyName, companySize, companyType, industry, headquarters, ...userData } = data;
    
    const user = {
      ...userData,
      password: hashedPassword,
      role: 'EMPLOYER' as UserRole,
      profile: {
        companyName,
        companySize,
        companyType,
        industry,
        headquarters,
        description: '',
        branches: [],
        verified: false,
      },
    };

    return this.userRepository.save(user);
  }

  async validateUser(email: string, pass: string): Promise<Omit<UserEntity, 'password'> | null> {
    const user = await this.userRepository.findOne({
      where: { email },
      select: [
        'id',
        'email',
        'password',
        'role',
        'firstName',
        'lastName',
        'status',
        'createdAt',
        'updatedAt',
        'phone',
        'avatarUrl',
        'verifiedAt',
        'profile'
      ],
    });

    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: Omit<UserEntity, 'password'>) {
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
