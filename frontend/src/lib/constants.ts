import { z } from 'zod';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    FORGOT_PASSWORD: '/auth/forgot-password',
  },
  // Users
  USERS: {
    BASE: '/users',
    PROFILE: '/users/profile',
    AVATAR: '/users/avatar',
  },
  // Jobs
  JOBS: {
    BASE: '/jobs',
    SEARCH: '/jobs/search',
    FEATURED: '/jobs/featured',
    RECOMMENDATIONS: '/jobs/recommendations',
  },
  // Applications
  APPLICATIONS: {
    BASE: '/applications',
    MY: '/applications/my',
  },
  // AI
  AI: {
    MATCH: '/ai/match',
    SKILL_GAP: '/ai/skill-gap',
    PRE_SCREENING: '/ai/pre-screening',
    EVALUATE: '/ai/evaluate',
    PARSE_RESUME: '/ai/parse-resume',
    GENERATE_DESCRIPTION: '/ai/generate-description',
  },
  // Notifications
  NOTIFICATIONS: {
    BASE: '/notifications',
    UNREAD: '/notifications/unread',
    READ_ALL: '/notifications/read-all',
  },
} as const;

// User Roles
export const USER_ROLES = {
  JOB_SEEKER: 'JOB_SEEKER',
  EMPLOYER: 'EMPLOYER',
  ADMIN: 'ADMIN',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// Route paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  JOBS: '/jobs',
  JOB_DETAIL: (id: string) => `/jobs/${id}`,
  PROFILE: '/profile',
  SETTINGS: '/settings',
  APPLICATIONS: '/applications',
  NOTIFICATIONS: '/notifications',
  // Admin routes
  ADMIN: {
    BASE: '/admin',
    USERS: '/admin/users',
    JOBS: '/admin/jobs',
    ANALYTICS: '/admin/analytics',
  },
  // Employer routes
  EMPLOYER: {
    BASE: '/employer',
    JOBS: '/employer/jobs',
    APPLICATIONS: '/employer/applications',
    ANALYTICS: '/employer/analytics',
  },
} as const;

// API Response validation schemas
export const API_RESPONSE_SCHEMAS = {
  SUCCESS: z.object({
    success: z.literal(true),
    data: z.unknown(),
    message: z.string().optional(),
    timestamp: z.string(),
  }),
  ERROR: z.object({
    statusCode: z.number(),
    message: z.string(),
    error: z.string(),
    details: z.record(z.unknown()).optional(),
    timestamp: z.string(),
  }),
} as const;

// Error messages
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'You must be logged in to access this resource',
  FORBIDDEN: 'You do not have permission to access this resource',
  NOT_FOUND: 'The requested resource was not found',
  NETWORK_ERROR: 'A network error occurred. Please try again',
  SERVER_ERROR: 'An unexpected error occurred. Please try again later',
  VALIDATION_ERROR: 'Please check your input and try again',
  TOKEN_EXPIRED: 'Your session has expired. Please log in again',
} as const;

// Timeouts
export const TIMEOUTS = {
  DEFAULT_REQUEST: 30000, // 30 seconds
  UPLOAD_REQUEST: 60000, // 60 seconds
} as const;

// Storage keys
export const STORAGE_KEYS = {
  AUTH: 'auth-storage',
  THEME: 'theme',
  LANGUAGE: 'language',
} as const;
