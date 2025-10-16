import axios, { AxiosInstance, AxiosError } from 'axios';

// ============================================
// CONFIGURACIÓN DE LA API
// ============================================

// URL base de tu backend - cambiar según tu configuración
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Crear instancia de axios con configuración base
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos
});

// ============================================
// INTERCEPTORES
// ============================================

// Interceptor de request - agregar token a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de response - manejar errores globalmente
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido - redirect a login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============================================
// TIPOS DE DATOS
// ============================================

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  referral_code?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  balance: number;
  referral_code: string;
  created_at: string;
}

export interface Stock {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change_24h: number;
  change_percent: number;
  sector: string;
  market_cap: number;
  volume: number;
  available_quantity: number;
  is_active: boolean;
}

export interface PortfolioItem {
  stock_id: string;
  symbol: string;
  name: string;
  quantity: number;
  avg_price: number;
  current_price: number;
  total_value: number;
  profit_loss: number;
  profit_loss_percent: number;
}

export interface Transaction {
  id: string;
  type: 'buy' | 'sell' | 'deposit' | 'withdrawal';
  stock_symbol?: string;
  quantity?: number;
  price?: number;
  total: number;
  status: 'completed' | 'pending' | 'failed';
  created_at: string;
}

export interface Referral {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  earnings: number;
  created_at: string;
}

// ============================================
// AUTENTICACIÓN
// ============================================

/**
 * POST /api/auth/login
 * Iniciar sesión
 */
export const login = async (credentials: LoginCredentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

/**
 * POST /api/auth/register
 * Registrar nuevo usuario
 */
export const register = async (data: RegisterData) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

/**
 * GET /api/auth/me
 * Obtener datos del usuario autenticado
 */
export const getCurrentUser = async (): Promise<{ user: User }> => {
  const response = await api.get('/auth/me');
  return response.data;
};

/**
 * POST /api/auth/logout
 * Cerrar sesión
 */
export const logout = async () => {
  const response = await api.post('/auth/logout');
  localStorage.removeItem('token');
  return response.data;
};

/**
 * POST /api/auth/forgot-password
 * Solicitar recuperación de contraseña
 */
export const forgotPassword = async (email: string) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

/**
 * POST /api/auth/reset-password
 * Restablecer contraseña
 */
export const resetPassword = async (token: string, password: string) => {
  const response = await api.post('/auth/reset-password', { token, password });
  return response.data;
};

// ============================================
// ACCIONES (STOCKS)
// ============================================

/**
 * GET /api/stocks
 * Obtener lista de acciones con filtros opcionales
 */
export const getStocks = async (filters?: {
  search?: string;
  sector?: string;
  min_price?: number;
  max_price?: number;
  sort_by?: 'price' | 'change' | 'volume';
  order?: 'asc' | 'desc';
}): Promise<{ stocks: Stock[] }> => {
  const response = await api.get('/stocks', { params: filters });
  return response.data;
};

/**
 * GET /api/stocks/:symbol
 * Obtener detalles de una acción específica
 */
export const getStockBySymbol = async (symbol: string): Promise<{ stock: Stock }> => {
  const response = await api.get(`/stocks/${symbol}`);
  return response.data;
};

/**
 * GET /api/stocks/:symbol/history
 * Obtener historial de precios de una acción
 */
export const getStockHistory = async (
  symbol: string,
  period: '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL' = '1M'
) => {
  const response = await api.get(`/stocks/${symbol}/history`, {
    params: { period }
  });
  return response.data;
};

// ============================================
// PORTAFOLIO
// ============================================

/**
 * GET /api/portfolio
 * Obtener portafolio del usuario
 */
export const getPortfolio = async (): Promise<{
  portfolio: PortfolioItem[];
  total_value: number;
  total_invested: number;
  total_profit: number;
}> => {
  const response = await api.get('/portfolio');
  return response.data;
};

/**
 * GET /api/portfolio/stats
 * Obtener estadísticas del portafolio
 */
export const getPortfolioStats = async () => {
  const response = await api.get('/portfolio/stats');
  return response.data;
};

/**
 * GET /api/portfolio/history
 * Obtener historial del valor del portafolio
 */
export const getPortfolioHistory = async (period: '1M' | '3M' | '6M' | '1Y' | 'ALL' = '1M') => {
  const response = await api.get('/portfolio/history', {
    params: { period }
  });
  return response.data;
};

// ============================================
// TRANSACCIONES
// ============================================

/**
 * POST /api/transactions/buy
 * Comprar acciones
 */
export const buyStock = async (stockId: string, quantity: number) => {
  const response = await api.post('/transactions/buy', {
    stock_id: stockId,
    quantity
  });
  return response.data;
};

/**
 * POST /api/transactions/sell
 * Vender acciones
 */
export const sellStock = async (stockId: string, quantity: number) => {
  const response = await api.post('/transactions/sell', {
    stock_id: stockId,
    quantity
  });
  return response.data;
};

/**
 * GET /api/transactions
 * Obtener historial de transacciones
 */
export const getTransactions = async (filters?: {
  type?: 'buy' | 'sell' | 'deposit' | 'withdrawal';
  status?: 'completed' | 'pending' | 'failed';
  limit?: number;
  offset?: number;
}): Promise<{ transactions: Transaction[]; total_count: number }> => {
  const response = await api.get('/transactions', { params: filters });
  return response.data;
};

/**
 * GET /api/transactions/:id
 * Obtener detalles de una transacción
 */
export const getTransactionById = async (id: string) => {
  const response = await api.get(`/transactions/${id}`);
  return response.data;
};

// ============================================
// WALLET (BILLETERA)
// ============================================

/**
 * GET /api/wallet/balance
 * Obtener saldo actual
 */
export const getBalance = async (): Promise<{ balance: number }> => {
  const response = await api.get('/wallet/balance');
  return response.data;
};

/**
 * POST /api/wallet/deposit
 * Realizar depósito
 */
export const deposit = async (amount: number, payment_method: string) => {
  const response = await api.post('/wallet/deposit', {
    amount,
    payment_method
  });
  return response.data;
};

/**
 * POST /api/wallet/withdrawal
 * Realizar retiro
 */
export const withdraw = async (amount: number, bank_account: string) => {
  const response = await api.post('/wallet/withdrawal', {
    amount,
    bank_account
  });
  return response.data;
};

/**
 * GET /api/wallet/history
 * Obtener historial de movimientos de wallet
 */
export const getWalletHistory = async () => {
  const response = await api.get('/wallet/history');
  return response.data;
};

// ============================================
// REFERIDOS
// ============================================

/**
 * GET /api/referrals
 * Obtener lista de referidos
 */
export const getReferrals = async (): Promise<{
  referrals: Referral[];
  total_earnings: number;
  active_referrals: number;
}> => {
  const response = await api.get('/referrals');
  return response.data;
};

/**
 * GET /api/referrals/stats
 * Obtener estadísticas de referidos
 */
export const getReferralStats = async () => {
  const response = await api.get('/referrals/stats');
  return response.data;
};

// ============================================
// DASHBOARD
// ============================================

/**
 * GET /api/dashboard/stats
 * Obtener estadísticas del dashboard
 */
export const getDashboardStats = async () => {
  const response = await api.get('/dashboard/stats');
  return response.data;
};

/**
 * GET /api/dashboard/recent-activity
 * Obtener actividad reciente
 */
export const getRecentActivity = async () => {
  const response = await api.get('/dashboard/recent-activity');
  return response.data;
};

// ============================================
// PERFIL
// ============================================

/**
 * PUT /api/profile
 * Actualizar perfil de usuario
 */
export const updateProfile = async (data: Partial<User>) => {
  const response = await api.put('/profile', data);
  return response.data;
};

/**
 * PUT /api/profile/password
 * Cambiar contraseña
 */
export const changePassword = async (currentPassword: string, newPassword: string) => {
  const response = await api.put('/profile/password', {
    current_password: currentPassword,
    new_password: newPassword
  });
  return response.data;
};

/**
 * POST /api/profile/avatar
 * Subir avatar
 */
export const uploadAvatar = async (file: File) => {
  const formData = new FormData();
  formData.append('avatar', file);
  
  const response = await api.post('/profile/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// ============================================
// WATCHLIST
// ============================================

/**
 * GET /api/watchlist
 * Obtener lista de seguimiento
 */
export const getWatchlist = async () => {
  const response = await api.get('/watchlist');
  return response.data;
};

/**
 * POST /api/watchlist
 * Agregar acción a watchlist
 */
export const addToWatchlist = async (stockId: string) => {
  const response = await api.post('/watchlist', { stock_id: stockId });
  return response.data;
};

/**
 * DELETE /api/watchlist/:stockId
 * Eliminar acción de watchlist
 */
export const removeFromWatchlist = async (stockId: string) => {
  const response = await api.delete(`/watchlist/${stockId}`);
  return response.data;
};

// ============================================
// ADMIN - USUARIOS
// ============================================

/**
 * GET /api/admin/users
 * Obtener lista de usuarios (solo admin)
 */
export const getUsers = async (filters?: {
  search?: string;
  role?: 'user' | 'admin';
  status?: 'active' | 'inactive';
  limit?: number;
  offset?: number;
}) => {
  const response = await api.get('/admin/users', { params: filters });
  return response.data;
};

/**
 * GET /api/admin/users/:id
 * Obtener detalles de un usuario (solo admin)
 */
export const getUserById = async (id: string) => {
  const response = await api.get(`/admin/users/${id}`);
  return response.data;
};

/**
 * PUT /api/admin/users/:id
 * Actualizar usuario (solo admin)
 */
export const updateUser = async (id: string, data: Partial<User>) => {
  const response = await api.put(`/admin/users/${id}`, data);
  return response.data;
};

/**
 * PUT /api/admin/users/:id/status
 * Cambiar estado de usuario (solo admin)
 */
export const changeUserStatus = async (id: string, status: 'active' | 'inactive') => {
  const response = await api.put(`/admin/users/${id}/status`, { status });
  return response.data;
};

/**
 * DELETE /api/admin/users/:id
 * Eliminar usuario (solo admin)
 */
export const deleteUser = async (id: string) => {
  const response = await api.delete(`/admin/users/${id}`);
  return response.data;
};

// ============================================
// ADMIN - ACCIONES
// ============================================

/**
 * POST /api/admin/stocks
 * Crear nueva acción (solo admin)
 */
export const createStock = async (data: Partial<Stock>) => {
  const response = await api.post('/admin/stocks', data);
  return response.data;
};

/**
 * PUT /api/admin/stocks/:id
 * Actualizar acción (solo admin)
 */
export const updateStock = async (id: string, data: Partial<Stock>) => {
  const response = await api.put(`/admin/stocks/${id}`, data);
  return response.data;
};

/**
 * PUT /api/admin/stocks/:id/toggle-active
 * Activar/desactivar trading de una acción (solo admin)
 */
export const toggleStockActive = async (id: string) => {
  const response = await api.put(`/admin/stocks/${id}/toggle-active`);
  return response.data;
};

/**
 * DELETE /api/admin/stocks/:id
 * Eliminar acción (solo admin)
 */
export const deleteStock = async (id: string) => {
  const response = await api.delete(`/admin/stocks/${id}`);
  return response.data;
};

// ============================================
// ADMIN - TRANSACCIONES
// ============================================

/**
 * GET /api/admin/transactions
 * Obtener todas las transacciones (solo admin)
 */
export const getAllTransactions = async (filters?: {
  user_id?: string;
  type?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}) => {
  const response = await api.get('/admin/transactions', { params: filters });
  return response.data;
};

/**
 * PUT /api/admin/transactions/:id/status
 * Cambiar estado de transacción (solo admin)
 */
export const updateTransactionStatus = async (
  id: string,
  status: 'completed' | 'pending' | 'failed'
) => {
  const response = await api.put(`/admin/transactions/${id}/status`, { status });
  return response.data;
};

// ============================================
// ADMIN - REPORTES
// ============================================

/**
 * GET /api/admin/reports/dashboard
 * Obtener estadísticas generales (solo admin)
 */
export const getAdminDashboardStats = async () => {
  const response = await api.get('/admin/reports/dashboard');
  return response.data;
};

/**
 * GET /api/admin/reports/transactions
 * Generar reporte de transacciones (solo admin)
 */
export const generateTransactionReport = async (filters: {
  date_from: string;
  date_to: string;
  format?: 'json' | 'csv' | 'pdf';
}) => {
  const response = await api.get('/admin/reports/transactions', {
    params: filters,
    responseType: filters.format !== 'json' ? 'blob' : 'json'
  });
  return response.data;
};

/**
 * GET /api/admin/reports/users
 * Generar reporte de usuarios (solo admin)
 */
export const generateUserReport = async () => {
  const response = await api.get('/admin/reports/users');
  return response.data;
};

// ============================================
// EXPORTAR INSTANCIA DE AXIOS
// ============================================

export default api;