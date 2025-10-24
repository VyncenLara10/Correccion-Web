'use client';

import { useAuth0 } from '@auth0/auth0-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

export function useAuth() {
  const router = useRouter();
  const {
    user: auth0User,
    isAuthenticated,
    isLoading,
    loginWithRedirect,
    logout: auth0Logout,
    getAccessTokenSilently,
  } = useAuth0();

  // Adaptar el usuario de Auth0 al formato que espera tu app
  const user = auth0User
    ? {
        id: auth0User.sub || '',
        email: auth0User.email || '',
        name: auth0User.name || '',
        picture: auth0User.picture || '',
        ...auth0User,
      }
    : null;

  // Login con email/password usando Auth0
  const login = async (data: LoginData) => {
    try {
      await loginWithRedirect({
        authorizationParams: {
          screen_hint: 'login',
          login_hint: data.email,
        },
        appState: {
          returnTo: '/dashboard',
        },
      });
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  };

  // Registro con email/password usando Auth0
  const register = async (data: RegisterData) => {
    try {
      await loginWithRedirect({
        authorizationParams: {
          screen_hint: 'signup',
          login_hint: data.email,
        },
        appState: {
          returnTo: '/dashboard',
        },
      });
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await auth0Logout({
        logoutParams: {
          returnTo: typeof window !== 'undefined' ? window.location.origin : '',
        },
      });
    } catch (error) {
      console.error('Error en logout:', error);
      toast.error('Error al cerrar sesión');
    }
  };

  // Obtener el token de acceso
  const getToken = async () => {
    try {
      return await getAccessTokenSilently();
    } catch (error) {
      console.error('Error obteniendo token:', error);
      return null;
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    getToken,
  };
}