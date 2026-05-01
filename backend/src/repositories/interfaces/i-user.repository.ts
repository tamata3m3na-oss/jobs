import { UserRole, UserStatus } from '@smartjob/shared';

export interface CreateUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string | null;
  avatarUrl?: string | null;
  profile?: Record<string, unknown>;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  avatarUrl?: string | null;
  status?: UserStatus;
  verifiedAt?: Date | null;
  profile?: Record<string, unknown>;
}

export interface UserFilterInput {
  role?: UserRole;
  status?: UserStatus;
  search?: string;
}

export interface PaginationInput {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IUserRepository {
  create(data: CreateUserInput): Promise<Record<string, unknown>>;
  findById(id: string): Promise<Record<string, unknown> | null>;
  findByEmail(email: string): Promise<Record<string, unknown> | null>;
  findAll(filter: UserFilterInput, pagination: PaginationInput): Promise<PaginatedResult<Record<string, unknown>>>;
  paginate(page: number, limit: number, search?: string): Promise<PaginatedResult<Record<string, unknown>>>;
  update(id: string, data: UpdateUserInput): Promise<Record<string, unknown>>;
  updateRole(userId: string, role: UserRole): Promise<Record<string, unknown>>;
  updateStatus(userId: string, status: UserStatus): Promise<Record<string, unknown>>;
  delete(id: string): Promise<void>;
  updateProfile(id: string, profile: Record<string, unknown>): Promise<Record<string, unknown>>;
  existsByEmail(email: string): Promise<boolean>;
}