import { create } from 'zustand';
import type { AuthUser } from './server/auth';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  hasPro: boolean;
  isLoading: boolean;
  authError: string | null;
  setAuthenticatedUser: (user: AuthUser) => void;
  setForbidden: (message: string) => void;
  clearSession: (message?: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
  hasPro: false,
  isLoading: true,
  authError: null,
  setAuthenticatedUser: (user) =>
    set({
      user,
      isAuthenticated: true,
      hasPro: true,
      isLoading: false,
      authError: null,
    }),
  setForbidden: (authError) =>
    set({
      user: null,
      isAuthenticated: true,
      hasPro: false,
      isLoading: false,
      authError,
    }),
  clearSession: (authError = null) =>
    set({
      user: null,
      isAuthenticated: false,
      hasPro: false,
      isLoading: false,
      authError,
    }),
  setLoading: (isLoading) => set({ isLoading }),
}));
