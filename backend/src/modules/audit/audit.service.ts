import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export enum AuditEvent {
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGOUT = 'LOGOUT',
  REGISTER_SUCCESS = 'REGISTER_SUCCESS',
  REFRESH_TOKEN_SUCCESS = 'REFRESH_TOKEN_SUCCESS',
  REFRESH_TOKEN_FAILED = 'REFRESH_TOKEN_FAILED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  USER_DELETED = 'USER_DELETED',
  PROFILE_UPDATED = 'PROFILE_UPDATED',
  ROLE_CHANGED = 'ROLE_CHANGED',
  JOB_CREATED = 'JOB_CREATED',
  JOB_UPDATED = 'JOB_UPDATED',
  JOB_DELETED = 'JOB_DELETED',
  JOB_PUBLISHED = 'JOB_PUBLISHED',
  JOB_CLOSED = 'JOB_CLOSED',
  JOB_VIEWED = 'JOB_VIEWED',
  APPLICATION_SUBMITTED = 'APPLICATION_SUBMITTED',
  APPLICATION_WITHDRAWN = 'APPLICATION_WITHDRAWN',
  STATUS_CHANGED = 'STATUS_CHANGED',
  INTERVIEW_SCHEDULED = 'INTERVIEW_SCHEDULED',
  INTERVIEW_COMPLETED = 'INTERVIEW_COMPLETED',
}

@Injectable()
export class AuditService {
  constructor(private readonly db: PrismaService) {}

  async log(data: {
    entityType: string;
    entityId: string;
    action: string | AuditEvent;
    userId?: string;
    userEmail?: string;
    changes?: any;
    metadata?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.db.auditLog.create({
      data: {
        entityType: data.entityType,
        entityId: data.entityId,
        action: data.action,
        userId: data.userId,
        userEmail: data.userEmail,
        changes: data.changes,
        metadata: data.metadata,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
  }
}
