'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

// ============================================
// TIPOS
// ============================================
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  balance?: number;
  phone?: string;
  address?: string;
  country?: string;
  full_name?: string;
  avatar?: string;
  created_at?: string;
  updated_at?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// ============================================
// CONFIGURACIÓN API
// ============================================
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Para cookies
});

// Interceptor para agregar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============================================
// HOOK useAuth
// ============================================
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar autenticación al cargar
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setUser(null);
        setIsAuthenticated(false);
        return;
      }

      // CONECTA CON: GET /api/auth/me
      const response = await api.get('/auth/me');
      setUser(response.data.user);
      setIsAuthenticated(true);
    } catch (err) {
      console.error('Error verificando autenticación:', err);
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      setError(null);

      // CONECTA CON: POST /api/auth/login
      const response = await api.post('/auth/login', credentials);
      
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      setUser(user);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al iniciar sesión';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setLoading(true);
      setError(null);

      if (data.password !== data.confirmPassword) {
        setError('Las contraseñas no coinciden');
        return { success: false, error: 'Las contraseñas no coinciden' };
      }

      // CONECTA CON: POST /api/auth/register
      const response = await api.post('/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password,
      });
      
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      setUser(user);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al registrarse';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // CONECTA CON: POST /api/auth/logout
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  const refreshUser = async () => {
    try {
      setLoading(true);
      // CONECTA CON: GET /api/auth/me
      const response = await api.get('/auth/me');
      setUser(response.data.user);
      setIsAuthenticated(true);
    } catch (err) {
      console.error('Error refrescando usuario:', err);
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    checkAuth,
    refreshUser,
  };
}