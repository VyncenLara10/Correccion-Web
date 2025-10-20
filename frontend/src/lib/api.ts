import axios, { AxiosInstance, AxiosError } from 'axios';

// ============================================
// CONFIGURACIÓN DE LA API
// ============================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// ============================================
// INTERCEPTORES
// ============================================

api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
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
  email: string;
  password: string;
  username?: string;
  full_name?: string;
  name?: string;
  country?: string;
  address?: string;
  phone?: string;
  date_of_birth?: string;
  id_document?: string;
  id_document_type?: string;
  password_confirm?: string;
  referral_code?: string;
  referral_code_used?: string;
  terms?: boolean;
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
  current_price: number;
  change_24h: number;
  change_percent: number;
  change_amount: number;
  sector: string;
  market_cap: number;
  volume: number;
  available_quantity: number;
  is_active: boolean;
  is_market_open?: boolean;
  is_in_watchlist?: boolean;
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

export interface StockCategory {
  id: string;
  name: string;
  description?: string;
}

// ============================================
// AUTENTICACIÓN
// ============================================

export const login = async (credentials: LoginCredentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    console.error('Error en login:', error);
    throw error;
  }
};

export const register = async (data: RegisterData) => {
  try {
    const response = await api.post('/auth/register', data);
    return response.data;
  } catch (error) {
    console.error('Error en register:', error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    throw error;
  }
};

export const logout = async () => {
  try {
    const response = await api.post('/auth/logout');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    return response.data;
  } catch (error) {
    console.error('Error en logout:', error);
    throw error;
  }
};

export const forgotPassword = async (email: string) => {
  try {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    console.error('Error en forgot password:', error);
    throw error;
  }
};

export const resetPassword = async (token: string, password: string) => {
  try {
    const response = await api.post('/auth/reset-password', { token, password });
    return response.data;
  } catch (error) {
    console.error('Error en reset password:', error);
    throw error;
  }
};

// ============================================
// ACCIONES (STOCKS) - COMPLETO
// ============================================

export const getStocks = async (filters?: {
  query?: string;
  category?: string;
  sort_by?: string;
  sort_order?: string;
  search?: string;
  sector?: string;
  min_price?: number;
  max_price?: number;
}) => {
  try {
    const response = await api.get('/stocks', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error al obtener acciones:', error);
    throw error;
  }
};

export const getStockBySymbol = async (symbol: string) => {
  try {
    const response = await api.get(`/stocks/${symbol}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener acción:', error);
    throw error;
  }
};

// Alias para compatibilidad
export const getStock = getStockBySymbol;

export const getStockHistory = async (
  symbolOrId: string, 
  period: string = '1M', 
  days?: number
) => {
  try {
    const params: any = { period };
    if (days) {
      params.days = days;
    }
    const response = await api.get(`/stocks/${symbolOrId}/history`, { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener historial:', error);
    throw error;
  }
};

export const getStockCategories = async () => {
  try {
    const response = await api.get('/stocks/categories');
    return response.data;
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    throw error;
  }
};

export const getGainers = async () => {
  try {
    const response = await api.get('/stocks/gainers');
    return response.data;
  } catch (error) {
    console.error('Error al obtener ganadoras:', error);
    throw error;
  }
};

export const getLosers = async () => {
  try {
    const response = await api.get('/stocks/losers');
    return response.data;
  } catch (error) {
    console.error('Error al obtener perdedoras:', error);
    throw error;
  }
};

export const getTrendingStocks = async () => {
  try {
    const response = await api.get('/stocks/trending');
    return response.data;
  } catch (error) {
    console.error('Error al obtener tendencias:', error);
    throw error;
  }
};

// ============================================
// PORTAFOLIO
// ============================================

export const getPortfolio = async () => {
  try {
    const response = await api.get('/portfolio');
    return response.data;
  } catch (error) {
    console.error('Error al obtener portafolio:', error);
    throw error;
  }
};

export const getPortfolioSummary = async () => {
  try {
    const response = await api.get('/portfolio/summary');
    return response.data;
  } catch (error) {
    console.error('Error al obtener resumen de portafolio:', error);
    throw error;
  }
};

export const getPortfolioStats = async () => {
  try {
    const response = await api.get('/portfolio/stats');
    return response.data;
  } catch (error) {
    console.error('Error al obtener stats:', error);
    throw error;
  }
};

export const getPortfolioHistory = async (period: string = '1M') => {
  try {
    const response = await api.get('/portfolio/history', { params: { period } });
    return response.data;
  } catch (error) {
    console.error('Error al obtener historial portafolio:', error);
    throw error;
  }
};

// ============================================
// TRANSACCIONES
// ============================================

export const createTransaction = async (data: {
  stock_id: string;
  transaction_type: 'buy' | 'sell';
  quantity: number;
  price?: number;
}) => {
  try {
    const response = await api.post('/transactions', data);
    return response.data;
  } catch (error) {
    console.error('Error al crear transacción:', error);
    throw error;
  }
};

export const buyStock = async (stockId: string, quantity: number) => {
  try {
    const response = await api.post('/transactions/buy', { stock_id: stockId, quantity });
    return response.data;
  } catch (error) {
    console.error('Error al comprar:', error);
    throw error;
  }
};

export const sellStock = async (stockId: string, quantity: number) => {
  try {
    const response = await api.post('/transactions/sell', { stock_id: stockId, quantity });
    return response.data;
  } catch (error) {
    console.error('Error al vender:', error);
    throw error;
  }
};

export const getTransactions = async (filters?: Record<string, any>) => {
  try {
    const response = await api.get('/transactions', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error al obtener transacciones:', error);
    throw error;
  }
};

export const getTransactionById = async (id: string) => {
  try {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener transacción:', error);
    throw error;
  }
};

export const getTransactionStats = async () => {
  try {
    const response = await api.get('/transactions/stats');
    return response.data;
  } catch (error) {
    console.error('Error al obtener estadísticas de transacciones:', error);
    throw error;
  }
};

export const getAllTransactions = async (filters?: {
  user_id?: string;
  type?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}) => {
  try {
    const response = await api.get('/admin/transactions', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error al obtener transacciones admin:', error);
    throw error;
  }
};

// ============================================
// WALLET (BILLETERA)
// ============================================

export const getBalance = async () => {
  try {
    const response = await api.get('/wallet/balance');
    return response.data;
  } catch (error) {
    console.error('Error al obtener balance:', error);
    throw error;
  }
};

export const deposit = async (data: {
  amount: number;
  bank_name: string;
  account_number: string;
}) => {
  try {
    const response = await api.post('/wallet/deposit', data);
    return response.data;
  } catch (error) {
    console.error('Error al depositar:', error);
    throw error;
  }
};

export const withdrawal = async (data: {
  amount: number;
  bank_name: string;
  account_number: string;
}) => {
  try {
    const response = await api.post('/wallet/withdrawal', data);
    return response.data;
  } catch (error) {
    console.error('Error al retirar:', error);
    throw error;
  }
};

// Alias opcional
export const withdraw = withdrawal;

export const getWalletTransactions = async ({ limit = 10 }) => {
  try {
    const response = await api.get(`/wallet/history?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener historial wallet:', error);
    throw error;
  }
};
// ============================================
// REFERIDOS
// ============================================

export const getReferrals = async () => {
  try {
    const response = await api.get('/referrals');
    return response.data;
  } catch (error) {
    console.error('Error al obtener referidos:', error);
    throw error;
  }
};

export const getReferralStats = async () => {
  try {
    const response = await api.get('/referrals/stats');
    return response.data;
  } catch (error) {
    console.error('Error al obtener stats referidos:', error);
    throw error;
  }
};

// ============================================
// DASHBOARD
// ============================================

export const getDashboardStats = async () => {
  try {
    const response = await api.get('/dashboard/stats');
    return response.data;
  } catch (error) {
    console.error('Error al obtener stats dashboard:', error);
    throw error;
  }
};

export const getRecentActivity = async () => {
  try {
    const response = await api.get('/dashboard/recent-activity');
    return response.data;
  } catch (error) {
    console.error('Error al obtener actividad:', error);
    throw error;
  }
};

// ============================================
// PERFIL
// ============================================

export const updateProfile = async (data: Partial<User>) => {
  try {
    const response = await api.put('/profile', data);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    throw error;
  }
};

export const changePassword = async (currentPassword: string, newPassword: string) => {
  try {
    const response = await api.put('/profile/password', {
      current_password: currentPassword,
      new_password: newPassword
    });
    return response.data;
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    throw error;
  }
};

export const uploadAvatar = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await api.post('/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error al subir avatar:', error);
    throw error;
  }
};

// ============================================
// REPORTES - NUEVO
// ============================================

export const getReports = async (filters?: {
  report_type?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
}) => {
  try {
    const response = await api.get('/reports', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error al obtener reportes:', error);
    throw error;
  }
};

export const requestReport = async (data: {
  report_type: string;
  start_date: string;
  end_date: string;
  format?: string;
}) => {
  try {
    const response = await api.post('/reports/request', data);
    return response.data;
  } catch (error) {
    console.error('Error al solicitar reporte:', error);
    throw error;
  }
};

export const downloadReport = async (reportId: string) => {
  try {
    const response = await api.get(`/reports/${reportId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Error al descargar reporte:', error);
    throw error;
  }
};

// ============================================
// WATCHLIST - NUEVO
// ============================================

export const getWatchlist = async () => {
  try {
    const response = await api.get('/watchlist');
    return response.data;
  } catch (error) {
    console.error('Error al obtener watchlist:', error);
    throw error;
  }
};

export const addToWatchlist = async (stockId: string) => {
  try {
    const response = await api.post('/watchlist', { stock_id: stockId });
    return response.data;
  } catch (error) {
    console.error('Error al agregar a watchlist:', error);
    throw error;
  }
};

export const removeFromWatchlist = async (stockId: string) => {
  try {
    const response = await api.delete(`/watchlist/${stockId}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar de watchlist:', error);
    throw error;
  }
};

export const toggleWatchlist = async (stockId: string) => {
  try {
    const response = await api.post(`/watchlist/toggle/${stockId}`);
    return response.data;
  } catch (error) {
    console.error('Error al toggle watchlist:', error);
    throw error;
  }
};

// ============================================
// ADMIN
// ============================================

export const getUsers = async (filters?: Record<string, any>) => {
  try {
    const response = await api.get('/admin/users', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
};

export const getUserById = async (id: string) => {
  try {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    throw error;
  }
};

export const updateUser = async (id: string, data: Partial<User>) => {
  try {
    const response = await api.put(`/admin/users/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    throw error;
  }
};

export const changeUserStatus = async (id: string, status: string) => {
  try {
    const response = await api.put(`/admin/users/${id}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error al cambiar estado usuario:', error);
    throw error;
  }
};

export const deleteUser = async (id: string) => {
  try {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    throw error;
  }
};

export const createStock = async (data: Partial<Stock>) => {
  try {
    const response = await api.post('/admin/stocks', data);
    return response.data;
  } catch (error) {
    console.error('Error al crear acción:', error);
    throw error;
  }
};

export const updateStock = async (id: string, data: Partial<Stock>) => {
  try {
    const response = await api.put(`/admin/stocks/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar acción:', error);
    throw error;
  }
};

export const toggleStockActive = async (id: string) => {
  try {
    const response = await api.put(`/admin/stocks/${id}/toggle-active`);
    return response.data;
  } catch (error) {
    console.error('Error al toggle acción:', error);
    throw error;
  }
};

export const deleteStock = async (id: string) => {
  try {
    const response = await api.delete(`/admin/stocks/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar acción:', error);
    throw error;
  }
};

export const updateTransactionStatus = async (id: string, status: string) => {
  try {
    const response = await api.put(`/admin/transactions/${id}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error al actualizar transacción:', error);
    throw error;
  }
};

export const getAdminDashboardStats = async () => {
  try {
    const response = await api.get('/admin/reports/dashboard');
    return response.data;
  } catch (error) {
    console.error('Error al obtener stats admin:', error);
    throw error;
  }
};

export const generateTransactionReport = async (filters: Record<string, any>) => {
  try {
    const response = await api.get('/admin/reports/transactions', {
      params: filters,
      responseType: filters.format !== 'json' ? 'blob' : 'json'
    });
    return response.data;
  } catch (error) {
    console.error('Error al generar reporte:', error);
    throw error;
  }
};

export const generateUserReport = async () => {
  try {
    const response = await api.get('/admin/reports/users');
    return response.data;
  } catch (error) {
    console.error('Error al generar reporte usuarios:', error);
    throw error;
  }
};

export default api;