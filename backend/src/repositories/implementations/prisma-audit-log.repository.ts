import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import {
  IAuditLogRepository,
  CreateAuditLogInput,
  AuditLogFilterInput,
  AuditLog,
} from '../interfaces/i-audit-log.repository';

@Injectable()
export class PrismaAuditLogRepository implements IAuditLogRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateAuditLogInput): Promise<AuditLog> {
    const auditLog = await this.prisma.auditLog.create({
      data: {
        entityType: data.entityType,
        entityId: data.entityId,
        action: data.action,
        userId: data.userId ?? null,
        userEmail: data.userEmail ?? null,
        changes: data.changes != null ? (data.changes as unknown as object) : Prisma.JsonNull,
        metadata:
          data.metadata != null ? (data.metadata as unknown as object) : Prisma.JsonNull,
        ipAddress: data.ipAddress ?? null,
        userAgent: data.userAgent ?? null,
      },
    });

    return auditLog as AuditLog;
  }

  async findById(id: string): Promise<AuditLog | null> {
    const auditLog = await this.prisma.auditLog.findUnique({
      where: { id },
    });

    return auditLog as AuditLog | null;
  }

  async findAll(
    filter: AuditLogFilterInput,
    pagination: { page: number; limit: number }
  ): Promise<{
    data: AuditLog[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const where: Record<string, unknown> = {};

    if (filter.entityType) {
      where.entityType = filter.entityType;
    }

    if (filter.entityId) {
      where.entityId = filter.entityId;
    }

    if (filter.action) {
      where.action = filter.action;
    }

    if (filter.userId) {
      where.userId = filter.userId;
    }

    if (filter.startDate || filter.endDate) {
      where.createdAt = {};
      if (filter.startDate) {
        (where.createdAt as Record<string, unknown>).gte = filter.startDate;
      }
      if (filter.endDate) {
        (where.createdAt as Record<string, unknown>).lte = filter.endDate;
      }
    }

    const [auditLogs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data: auditLogs as AuditLog[],
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    };
  }

  async findByEntity(entityType: string, entityId: string): Promise<AuditLog[]> {
    const auditLogs = await this.prisma.auditLog.findMany({
      where: { entityType, entityId },
      orderBy: { createdAt: 'desc' },
    });

    return auditLogs as AuditLog[];
  }

  async findByUser(
    userId: string,
    pagination: { page: number; limit: number }
  ): Promise<{
    data: AuditLog[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const [auditLogs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: { userId },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count({ where: { userId } }),
    ]);

    return {
      data: auditLogs as AuditLog[],
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    };
  }
}
