import { Injectable } from '@nestjs/common';
import { UserRole, UserStatus } from '@smartjob/shared';
import { Prisma } from '@prisma/client';
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
    const profileValue = data.profile != null
      ? (data.profile as Prisma.InputJsonValue)
      : Prisma.JsonNull;

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        phone: data.phone ?? null,
        avatarUrl: data.avatarUrl ?? null,
        profile: profileValue,
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
    const where: Prisma.UserWhereInput = {};

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

  async paginate(
    page: number,
    limit: number,
    search?: string
  ): Promise<PaginatedResult<Record<string, unknown>>> {
    const where: Prisma.UserWhereInput = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users as Record<string, unknown>[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(id: string, data: UpdateUserInput): Promise<Record<string, unknown>> {
    const updateData: Prisma.UserUpdateInput = {};

    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.phone !== undefined) updateData.phone = data.phone ?? null;
    if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl ?? null;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.verifiedAt !== undefined) updateData.verifiedAt = data.verifiedAt ?? null;
    if (data.profile !== undefined) {
      updateData.profile = data.profile != null
        ? (data.profile as Prisma.InputJsonValue)
        : Prisma.JsonNull;
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    return user as Record<string, unknown>;
  }

  async updateRole(userId: string, role: UserRole): Promise<Record<string, unknown>> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    return user as Record<string, unknown>;
  }

  async updateStatus(userId: string, status: UserStatus): Promise<Record<string, unknown>> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { status },
    });

    return user as Record<string, unknown>;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }

  async updateProfile(
    id: string,
    profile: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    const user = await this.prisma.user.update({
      where: { id },
      data: { profile: profile as Prisma.InputJsonValue },
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
