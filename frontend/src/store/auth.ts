import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';
import { login as apiLogin, register as apiRegister, setToken, clearToken, getCurrentUser } from '../utils/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, name: string, role?: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: async (email: string, password: string) => {
        try {
          const data = await apiLogin(email, password);
          setToken(data.access_token);
          // Fetch user info from backend using /users/me
          const backendUser = await getCurrentUser();
          console.log('LOGIN SUCCESS', { backendUser });
          set({ user: backendUser, isAuthenticated: true });
        } catch (err: unknown) {
          console.error('LOGIN ERROR', err);
          throw new Error((err as any).response?.data?.detail || 'Login failed');
        }
      },
      logout: () => {
        clearToken();
        set({ user: null, isAuthenticated: false });
      },
      register: async (email: string, password: string, name: string, role?: string) => {
        try {
          const data = await apiRegister(email, password, name, role);
          setToken(data.access_token);
          set({ user: data.user, isAuthenticated: true });
        } catch (err: any) {
          throw new Error(err.response?.data?.detail || 'Registration failed');
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);