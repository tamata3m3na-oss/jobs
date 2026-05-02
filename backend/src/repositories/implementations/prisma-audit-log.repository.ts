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
    const changesValue = data.changes != null
      ? (data.changes as Prisma.InputJsonValue)
      : Prisma.JsonNull;
    const metadataValue = data.metadata != null
      ? (data.metadata as Prisma.InputJsonValue)
      : Prisma.JsonNull;

    const auditLog = await this.prisma.auditLog.create({
      data: {
        entityType: data.entityType,
        entityId: data.entityId,
        action: data.action,
        userId: data.userId ?? null,
        userEmail: data.userEmail ?? null,
        changes: changesValue,
        metadata: metadataValue,
        ipAddress: data.ipAddress ?? null,
        userAgent: data.userAgent ?? null,
      },
    });

    return {
      id: auditLog.id,
      entityType: auditLog.entityType,
      entityId: auditLog.entityId,
      action: auditLog.action,
      userId: auditLog.userId,
      userEmail: auditLog.userEmail,
      changes: auditLog.changes as AuditLog['changes'],
      metadata: auditLog.metadata as AuditLog['metadata'],
      ipAddress: auditLog.ipAddress,
      userAgent: auditLog.userAgent,
      createdAt: auditLog.createdAt,
    };
  }

  async findById(id: string): Promise<AuditLog | null> {
    const auditLog = await this.prisma.auditLog.findUnique({
      where: { id },
    });

    if (!auditLog) return null;

    return {
      id: auditLog.id,
      entityType: auditLog.entityType,
      entityId: auditLog.entityId,
      action: auditLog.action,
      userId: auditLog.userId,
      userEmail: auditLog.userEmail,
      changes: auditLog.changes as AuditLog['changes'],
      metadata: auditLog.metadata as AuditLog['metadata'],
      ipAddress: auditLog.ipAddress,
      userAgent: auditLog.userAgent,
      createdAt: auditLog.createdAt,
    };
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
    const where: Prisma.AuditLogWhereInput = {};

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
        where.createdAt.gte = filter.startDate;
      }
      if (filter.endDate) {
        where.createdAt.lte = filter.endDate;
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
      data: auditLogs.map((log) => ({
        id: log.id,
        entityType: log.entityType,
        entityId: log.entityId,
        action: log.action,
        userId: log.userId,
        userEmail: log.userEmail,
        changes: log.changes as AuditLog['changes'],
        metadata: log.metadata as AuditLog['metadata'],
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        createdAt: log.createdAt,
      })),
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

    return auditLogs.map((log) => ({
      id: log.id,
      entityType: log.entityType,
      entityId: log.entityId,
      action: log.action,
      userId: log.userId,
      userEmail: log.userEmail,
      changes: log.changes as AuditLog['changes'],
      metadata: log.metadata as AuditLog['metadata'],
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      createdAt: log.createdAt,
    }));
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
      data: auditLogs.map((log) => ({
        id: log.id,
        entityType: log.entityType,
        entityId: log.entityId,
        action: log.action,
        userId: log.userId,
        userEmail: log.userEmail,
        changes: log.changes as AuditLog['changes'],
        metadata: log.metadata as AuditLog['metadata'],
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        createdAt: log.createdAt,
      })),
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    };
  }
}
