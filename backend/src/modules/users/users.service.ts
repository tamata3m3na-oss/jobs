import { Injectable, NotFoundException } from '@nestjs/common';
import { IUserRepository } from '../../repositories/interfaces/i-user.repository';
import { UpdateJobSeekerProfile, UpdateEmployerProfile } from '@smartjob/shared';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: IUserRepository,
  ) {}

  async findOne(id: string): Promise<Record<string, unknown>> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateProfile(
    id: string,
    profileData: UpdateJobSeekerProfile | UpdateEmployerProfile,
  ): Promise<Record<string, unknown>> {
    const user = await this.findOne(id);
    const existingProfile = (user.profile as Record<string, unknown>) ?? {};
    return this.userRepository.updateProfile(id, {
      ...existingProfile,
      ...profileData,
    });
  }

  async findAll(): Promise<Record<string, unknown>[]> {
    const result = await this.userRepository.findAll({}, { page: 1, limit: 1000 });
    return result.data;
  }
}