import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// User interface matching shared schema
interface BaseUserFields {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'JOB_SEEKER' | 'EMPLOYER' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';
  phone?: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  verifiedAt?: Date;
}

interface JobSeekerUser extends BaseUserFields {
  role: 'JOB_SEEKER';
  profile: Record<string, unknown>;
}

interface EmployerUser extends BaseUserFields {
  role: 'EMPLOYER';
  profile: Record<string, unknown>;
}

interface AdminUser extends BaseUserFields {
  role: 'ADMIN';
}

export type AppUser = JobSeekerUser | EmployerUser | AdminUser;

// Extended auth state with loading states
interface AuthState {
  user: AppUser | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  lastUpdated: number | null;

  // Actions
  setAuth: (user: AppUser, token: string, refreshToken?: string) => void;
  updateUser: (userData: Partial<AppUser>) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
}

// Create custom storage that handles serialization
const customStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(name);
  },
  setItem: (name: string, value: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(name, value);
    }
  },
  removeItem: (name: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(name);
    }
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      lastUpdated: null,

      setAuth: (user, token, refreshToken) =>
        set({
          user,
          token,
          refreshToken: refreshToken || null,
          isAuthenticated: true,
          lastUpdated: Date.now(),
        }),

      updateUser: (userData) =>
        set((state) => {
          if (!state.user) return state;
          return {
            user: { ...state.user, ...userData } as AppUser,
            lastUpdated: Date.now(),
          };
        }),

      logout: () =>
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          lastUpdated: Date.now(),
        }),

      setLoading: (loading) => set({ isLoading: loading }),

      clearAuth: () =>
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
          lastUpdated: null,
        }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => customStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Selectors for optimized access
export const selectUser = (state: AuthState) => state.user;
export const selectToken = (state: AuthState) => state.token;
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
export const selectIsLoading = (state: AuthState) => state.isLoading;
export const selectUserRole = (state: AuthState) => state.user?.role;
