import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';
const DEV_MODE = true;

export interface User {
  id: string;
  email: string;
  username: string;
  full_name: string;
  role: 'admin' | 'user';
  status: 'pending' | 'active' | 'suspended' | 'inactive';
  balance: number;
  referral_code: string;
  portfolio_value?: number;
  total_profit_loss?: number;
  phone?: string;
  date_of_birth?: string;
  address?: string;
  country?: string;
  email_verified?: boolean;
  created_at?: string;
  last_login?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        if(DEV_MODE){
              const mockUser = {
                id: '1',
                email: 'demo@tikalinvest.com',
                username: 'demo',
                full_name: 'Usuario Demo',
                role: 'user' as const,
                status: 'active' as const,
                balance: 10000,
                referral_code: 'DEMO1234',
                portfolio_value: 5000,
                total_profit_loss: 500,
    };
    set({ user: mockUser, isAuthenticated: true, isLoading: false });
    return;
        }
      },

      register: async (data: any) => {
        set({ isLoading: true });
        try {
          await api.register(data);
          set({ isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await api.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({ user: null, isAuthenticated: false });
          if (typeof window !== 'undefined') {
            window.location.href = '/';
          }
        }
      },

      refreshUser: async () => {
        try {
          const user = await api.getMe();
          set({ user, isAuthenticated: true });
        } catch (error) {
          console.error('Error refreshing user:', error);
          set({ user: null, isAuthenticated: false });
        }
      },

      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);