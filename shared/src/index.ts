// Schemas
export * from './schemas/user.schema';
export * from './schemas/job.schema';
export * from './schemas/application.schema';
export * from './schemas/ai.schema';

// Common utilities
export { LocationSchema } from './schemas/user.schema';
export type { Location } from './schemas/user.schema';

// API Response types
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

export interface ApiSuccess<T = unknown> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;

// Auth types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface TokenPayload {
  sub: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

// Geospatial types
export interface GeoPoint {
  type: 'Point';
  coordinates: [number, number];
}

export interface GeoBoundingBox {
  topLeft: GeoPoint;
  bottomRight: GeoPoint;
}

export interface GeoDistance {
  from: GeoPoint;
  to: GeoPoint;
  distance: number;
  unit: 'km' | 'mi';
}

// Notification types
export type NotificationType =
  | 'JOB_APPLICATION_RECEIVED'
  | 'APPLICATION_STATUS_CHANGED'
  | 'INTERVIEW_SCHEDULED'
  | 'INTERVIEW_REMINDER'
  | 'OFFER_RECEIVED'
  | 'JOB_MATCH_FOUND'
  | 'MESSAGE_RECEIVED'
  | 'PROFILE_VIEWED'
  | 'SUBSCRIPTION_EXPIRING'
  | 'SYSTEM_NOTIFICATION';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: Date;
}

// Match types
export interface MatchResult {
  applicantId: string;
  jobId: string;
  score: number;
  breakdown: {
    skills: number;
    experience: number;
    education: number;
    location: number;
    salary: number;
  };
  matchedSkills: string[];
  missingSkills: string[];
  recommendations: string[];
}
