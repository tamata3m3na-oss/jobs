'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, AppUser } from '@/stores/useAuthStore';
import { api } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';

interface AuthContextType {
  user: AppUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: RegisterData) => Promise<void>;
  refreshToken: () => Promise<string | null>;
  updateUser: (userData: Partial<AppUser>) => void;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'JOB_SEEKER' | 'EMPLOYER';
  phone?: string;
  companyName?: string;
  companySize?: string;
  companyType?: string;
  industry?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const {
    user,
    token,
    isAuthenticated,
    isLoading: storeLoading,
    setAuth,
    logout: storeLogout,
    updateUser: storeUpdateUser,
    setLoading,
  } = useAuthStore();

  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize auth state from store on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check if we have a token and need to validate it
        if (token && isAuthenticated && !user) {
          setLoading(true);
          try {
            const response = await api.get<{ data: AppUser }>(API_ENDPOINTS.AUTH.ME);
            if (response?.data) {
              setAuth(response.data as AppUser, token);
            }
          } catch {
            // Token is invalid, clear auth
            storeLogout();
          }
        }
      } finally {
        setIsInitializing(false);
        setLoading(false);
      }
    };

    initAuth();
  }, [token, isAuthenticated, user, setLoading, setAuth, storeLogout]);

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      try {
        const response = await api.post<{
          data: { user: AppUser; accessToken: string; refreshToken?: string };
        }>(API_ENDPOINTS.AUTH.LOGIN, { email, password });

        if (response?.data) {
          const { user: userData, accessToken, refreshToken } = response.data;
          setAuth(userData as AppUser, accessToken, refreshToken);
          router.push('/dashboard');
        }
      } catch (error) {
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [router, setAuth, setLoading]
  );

  const logout = useCallback(() => {
    storeLogout();
    router.push('/login');
  }, [router, storeLogout]);

  const register = useCallback(
    async (data: RegisterData) => {
      setLoading(true);
      try {
        const endpoint =
          data.role === 'EMPLOYER'
            ? API_ENDPOINTS.AUTH.REGISTER + '/employer'
            : API_ENDPOINTS.AUTH.REGISTER + '/job-seeker';

        const response = await api.post<{
          data: { user: AppUser; accessToken: string; refreshToken?: string };
        }>(endpoint, data);

        if (response?.data) {
          const { user: userData, accessToken, refreshToken } = response.data;
          setAuth(userData as AppUser, accessToken, refreshToken);
          router.push('/dashboard');
        }
      } catch (error) {
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [router, setAuth, setLoading]
  );

  const refreshToken = useCallback(async (): Promise<string | null> => {
    const currentToken = useAuthStore.getState().token;
    if (!currentToken) return null;

    try {
      const response = await api.post<{
        data: { accessToken: string };
      }>(API_ENDPOINTS.AUTH.REFRESH, {});

      if (response?.data?.accessToken) {
        const newToken = response.data.accessToken;
        setAuth(useAuthStore.getState().user!, newToken);
        return newToken;
      }
    } catch {
      storeLogout();
    }
    return null;
  }, [setAuth, storeLogout]);

  const updateUser = useCallback(
    (userData: Partial<AppUser>) => {
      storeUpdateUser(userData);
    },
    [storeUpdateUser]
  );

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading: isInitializing || storeLoading,
    login,
    logout,
    register,
    refreshToken,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
