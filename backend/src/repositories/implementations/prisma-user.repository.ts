import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  IUserRepository,
  CreateUserInput,
  UpdateUserInput,
  UserFilterInput,
  PaginationInput,
  PaginatedResult,
} from '../interfaces/i-user.repository';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserInput): Promise<Record<string, unknown>> {
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        phone: data.phone ?? null,
        avatarUrl: data.avatarUrl ?? null,
        profile: data.profile ?? null,
        status: 'PENDING_VERIFICATION',
      },
    });

    return user as Record<string, unknown>;
  }

  async findById(id: string): Promise<Record<string, unknown> | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    return user as Record<string, unknown> | null;
  }

  async findByEmail(email: string): Promise<Record<string, unknown> | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    return user as Record<string, unknown> | null;
  }

  async findAll(
    filter: UserFilterInput,
    pagination: PaginationInput
  ): Promise<PaginatedResult<Record<string, unknown>>> {
    const where: Record<string, unknown> = {};

    if (filter.role) {
      where.role = filter.role;
    }

    if (filter.status) {
      where.status = filter.status;
    }

    if (filter.search) {
      where.OR = [
        { email: { contains: filter.search, mode: 'insensitive' } },
        { firstName: { contains: filter.search, mode: 'insensitive' } },
        { lastName: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users as Record<string, unknown>[],
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    };
  }

  async update(id: string, data: UpdateUserInput): Promise<Record<string, unknown>> {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone ?? null,
        avatarUrl: data.avatarUrl ?? null,
        status: data.status,
        verifiedAt: data.verifiedAt ?? null,
        profile: data.profile ?? null,
      },
    });

    return user as Record<string, unknown>;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }

  async updateProfile(id: string, profile: Record<string, unknown>): Promise<Record<string, unknown>> {
    const user = await this.prisma.user.update({
      where: { id },
      data: { profile: profile as unknown },
    });

    return user as Record<string, unknown>;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { email },
    });

    return count > 0;
  }
}