export interface CreateAuditLogInput {
  entityType: string;
  entityId: string;
  action: string;
  userId?: string | null;
  userEmail?: string | null;
  changes?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface AuditLogFilterInput {
  entityType?: string;
  entityId?: string;
  action?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface AuditLog {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  userId: string | null;
  userEmail: string | null;
  changes: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}

export interface IAuditLogRepository {
  create(data: CreateAuditLogInput): Promise<AuditLog>;
  findById(id: string): Promise<AuditLog | null>;
  findAll(
    filter: AuditLogFilterInput,
    pagination: { page: number; limit: number }
  ): Promise<{
    data: AuditLog[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
  findByEntity(entityType: string, entityId: string): Promise<AuditLog[]>;
  findByUser(
    userId: string,
    pagination: { page: number; limit: number }
  ): Promise<{
    data: AuditLog[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
}
