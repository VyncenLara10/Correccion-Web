import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as api from '@/lib/api';
import type { User, LoginCredentials, RegisterData } from '@/lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Acciones
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  clearError: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });
        try {
          // CONECTA CON: POST /api/auth/login
          const data = await api.login(credentials);
          
          if (data.token) {
            localStorage.setItem('token', data.token);
            set({ 
              user: data.user, 
              token: data.token, 
              isLoading: false 
            });
          }
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Error al iniciar sesión';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null });
        try {
          // CONECTA CON: POST /api/auth/register
          const response = await api.register(data);
          
          // Después de registrar, hacer login automáticamente
          if (response.token) {
            localStorage.setItem('token', response.token);
            set({ 
              user: response.user, 
              token: response.token, 
              isLoading: false 
            });
          } else {
            // Si no viene token, hacer login manual
            await get().login({ email: data.email, password: data.password });
          }
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Error al registrarse';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          // CONECTA CON: POST /api/auth/logout
          await api.logout();
        } catch (error) {
          console.error('Error al cerrar sesión:', error);
        } finally {
          localStorage.removeItem('token');
          set({ user: null, token: null });
        }
      },

      fetchCurrentUser: async () => {
        set({ isLoading: true, error: null });
        try {
          // CONECTA CON: GET /api/auth/me
          const data = await api.getCurrentUser();
          set({ user: data.user, isLoading: false });
        } catch (error: any) {
          console.error('Error al obtener usuario:', error);
          set({ error: 'No se pudo cargar el usuario', isLoading: false });
          // Si falla, hacer logout
          get().logout();
        }
      },

      updateUser: (data: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...data } });
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        token: state.token,
        user: state.user 
      }),
    }
  )
);