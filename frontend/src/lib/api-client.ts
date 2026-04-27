import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/useAuthStore';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
  statusCode: number;
}

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    
    const message = error.response?.data?.message || 'An unexpected error occurred';
    
    // Standardize error format
    const appError = {
      message,
      status: error.response?.status,
      errors: error.response?.data?.errors,
    };
    
    return Promise.reject(appError);
  }
);

export default apiClient;
