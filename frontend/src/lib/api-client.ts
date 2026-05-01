import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { useAuthStore } from '@/stores/useAuthStore';
import { API_ENDPOINTS, TIMEOUTS, ERROR_MESSAGES } from './constants';
import type { ZodSchema } from 'zod';

// Standardized API error interface
export interface ApiError {
  message: string;
  status: number | undefined;
  errors?: Record<string, string[]>;
}

// Extended request config with retry flag
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Token refresh state
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

const onRefreshFailed = () => {
  refreshSubscribers = [];
  useAuthStore.getState().logout();
};

// Create axios instance with configuration
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: TIMEOUTS.DEFAULT_REQUEST,
  });

  // Request interceptor
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = useAuthStore.getState().token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor with retry logic
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ApiError>) => {
      const originalRequest = error.config as ExtendedAxiosRequestConfig;

      // Handle 401 errors with token refresh
      if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve) => {
            subscribeTokenRefresh((token: string) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              resolve(client(originalRequest));
            });
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshToken = useAuthStore.getState().token;
          if (!refreshToken) {
            throw new Error('No refresh token available');
          }

          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}${API_ENDPOINTS.AUTH.REFRESH}`,
            {},
            {
              headers: {
                Authorization: `Bearer ${refreshToken}`,
              },
            }
          );

          const { accessToken } = response.data;
          useAuthStore.getState().setAuth(useAuthStore.getState().user!, accessToken);
          onTokenRefreshed(accessToken);
          isRefreshing = false;

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          return client(originalRequest);
        } catch (refreshError) {
          isRefreshing = false;
          onRefreshFailed();
          return Promise.reject(refreshError);
        }
      }

      // Standardize error format
      const message = error.response?.data?.message || ERROR_MESSAGES.SERVER_ERROR;

      const appError: ApiError = {
        message,
        status: error.response?.status,
        errors: error.response?.data?.errors,
      };

      return Promise.reject(appError);
    }
  );

  return client;
};

export const apiClient = createApiClient();

// Retry logic with exponential backoff
export const retryConfig = {
  retries: 3,
  retryDelay: (retryCount: number) => Math.min(1000 * 2 ** retryCount, 30000),
};

// Helper functions
function shouldRetry(error: unknown): boolean {
  if (error instanceof AxiosError) {
    // Retry on network errors and 5xx errors
    return !error.response || error.response.status >= 500;
  }
  return false;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// API methods with retry and validation
export const api = {
  get: async <T>(
    url: string,
    schema?: ZodSchema<T>,
    options?: { retries?: number }
  ): Promise<T> => {
    const attemptRequest = async (retries: number): Promise<T> => {
      try {
        const response: AxiosResponse = await apiClient.get(url);
        if (schema) {
          return schema.parse(response.data) as T;
        }
        return response.data as T;
      } catch (error) {
        if (retries > 0 && shouldRetry(error)) {
          await delay(retryConfig.retryDelay(3 - retries));
          return attemptRequest(retries - 1);
        }
        throw error;
      }
    };
    return attemptRequest(options?.retries ?? retryConfig.retries);
  },

  post: async <T>(
    url: string,
    data?: unknown,
    schema?: ZodSchema<T>,
    options?: { retries?: number }
  ): Promise<T> => {
    const attemptRequest = async (retries: number): Promise<T> => {
      try {
        const response: AxiosResponse = await apiClient.post(url, data);
        if (schema) {
          return schema.parse(response.data) as T;
        }
        return response.data as T;
      } catch (error) {
        if (retries > 0 && shouldRetry(error)) {
          await delay(retryConfig.retryDelay(3 - retries));
          return attemptRequest(retries - 1);
        }
        throw error;
      }
    };
    return attemptRequest(options?.retries ?? retryConfig.retries);
  },

  put: async <T>(
    url: string,
    data?: unknown,
    schema?: ZodSchema<T>,
    options?: { retries?: number }
  ): Promise<T> => {
    const attemptRequest = async (retries: number): Promise<T> => {
      try {
        const response: AxiosResponse = await apiClient.put(url, data);
        if (schema) {
          return schema.parse(response.data) as T;
        }
        return response.data as T;
      } catch (error) {
        if (retries > 0 && shouldRetry(error)) {
          await delay(retryConfig.retryDelay(3 - retries));
          return attemptRequest(retries - 1);
        }
        throw error;
      }
    };
    return attemptRequest(options?.retries ?? retryConfig.retries);
  },

  patch: async <T>(
    url: string,
    data?: unknown,
    schema?: ZodSchema<T>,
    options?: { retries?: number }
  ): Promise<T> => {
    const attemptRequest = async (retries: number): Promise<T> => {
      try {
        const response: AxiosResponse = await apiClient.patch(url, data);
        if (schema) {
          return schema.parse(response.data) as T;
        }
        return response.data as T;
      } catch (error) {
        if (retries > 0 && shouldRetry(error)) {
          await delay(retryConfig.retryDelay(3 - retries));
          return attemptRequest(retries - 1);
        }
        throw error;
      }
    };
    return attemptRequest(options?.retries ?? retryConfig.retries);
  },

  delete: async <T>(
    url: string,
    schema?: ZodSchema<T>,
    options?: { retries?: number }
  ): Promise<T> => {
    const attemptRequest = async (retries: number): Promise<T> => {
      try {
        const response: AxiosResponse = await apiClient.delete(url);
        if (schema) {
          return schema.parse(response.data) as T;
        }
        return response.data as T;
      } catch (error) {
        if (retries > 0 && shouldRetry(error)) {
          await delay(retryConfig.retryDelay(3 - retries));
          return attemptRequest(retries - 1);
        }
        throw error;
      }
    };
    return attemptRequest(options?.retries ?? retryConfig.retries);
  },

  upload: async <T>(
    url: string,
    formData: FormData,
    schema?: ZodSchema<T>,
    onProgress?: (progress: number) => void
  ): Promise<T> => {
    const response: AxiosResponse = await apiClient.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
      timeout: TIMEOUTS.UPLOAD_REQUEST,
    });

    if (schema) {
      return schema.parse(response.data) as T;
    }
    return response.data as T;
  },
};

export default apiClient;
