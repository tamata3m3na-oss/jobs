import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { IUserRepository, PaginatedResult } from '../../repositories/interfaces/i-user.repository';
import { 
  UpdateJobSeekerProfile, 
  UpdateEmployerProfile, 
  UserRole, 
  UserStatus,
  BaseUser
} from '@smartjob/shared';
import { 
  CreateUserDto, 
  UpdateUserDto, 
  PaginationQueryDto,
  UserResponseDto 
} from './dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: IUserRepository,
  ) {}

  async createUser(data: CreateUserDto): Promise<UserResponseDto> {
    const exists = await this.userRepository.existsByEmail(data.email);
    if (exists) {
      throw new ConflictException('User with this email already exists');
    }

    // Determine role based on data (since it's a union)
    let role: UserRole = 'JOB_SEEKER';
    if ('companyName' in data) {
      role = 'EMPLOYER';
    }

    const user = await this.userRepository.create({
      ...data,
      role,
    });

    return this.mapToResponse(user);
  }

  async getUserById(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.mapToResponse(user);
  }

  async getUserByEmail(email: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.mapToResponse(user);
  }

  async updateUser(id: string, data: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.userRepository.update(id, data);
    return this.mapToResponse(updatedUser);
  }

  async listUsers(pagination: PaginationQueryDto): Promise<PaginatedResult<UserResponseDto>> {
    const result = await this.userRepository.paginate(
      pagination.page,
      pagination.limit,
      pagination.search
    );

    return {
      ...result,
      data: result.data.map(user => this.mapToResponse(user)),
    };
  }

  async getJobSeekerProfile(userId: string): Promise<Record<string, unknown>> {
    const user = await this.getUserById(userId);
    if (user.role !== 'JOB_SEEKER') {
      throw new ForbiddenException('User is not a job seeker');
    }
    return (user as unknown as { profile?: Record<string, unknown> }).profile || {};
  }

  async updateJobSeekerProfile(userId: string, data: UpdateJobSeekerProfile): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.role !== 'JOB_SEEKER') {
      throw new ForbiddenException('User is not a job seeker');
    }

    const existingProfile = (user.profile as Record<string, unknown>) ?? {};
    const updatedUser = await this.userRepository.updateProfile(userId, {
      ...existingProfile,
      ...data,
    });

    return this.mapToResponse(updatedUser);
  }

  async getEmployerProfile(userId: string): Promise<Record<string, unknown>> {
    const user = await this.getUserById(userId);
    if (user.role !== 'EMPLOYER') {
      throw new ForbiddenException('User is not an employer');
    }
    return (user as unknown as { profile?: Record<string, unknown> }).profile || {};
  }

  async updateEmployerProfile(userId: string, data: UpdateEmployerProfile): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.role !== 'EMPLOYER') {
      throw new ForbiddenException('User is not an employer');
    }

    const existingProfile = (user.profile as Record<string, unknown>) ?? {};
    const updatedUser = await this.userRepository.updateProfile(userId, {
      ...existingProfile,
      ...data,
    });

    return this.mapToResponse(updatedUser);
  }

  async assignRole(userId: string, role: UserRole): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.userRepository.updateRole(userId, role);
    return this.mapToResponse(updatedUser);
  }

  async updateStatus(userId: string, status: UserStatus): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.userRepository.updateStatus(userId, status);
    return this.mapToResponse(updatedUser);
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.userRepository.delete(id);
  }

  private mapToResponse(user: Record<string, unknown>): UserResponseDto {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as unknown as UserResponseDto;
  }
}
