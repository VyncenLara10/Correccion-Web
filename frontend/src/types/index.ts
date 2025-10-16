// ============================================
// TIPOS GLOBALES DE TIKALINVEST
// ============================================

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  balance: number;
  referral_code: string;
  avatar?: string;
  phone?: string;
  address?: string;
  created_at: string;
  updated_at?: string;
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
  description?: string;
  logo?: string;
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
  user_id: string;
  type: 'buy' | 'sell' | 'deposit' | 'withdrawal';
  stock_id?: string;
  stock_symbol?: string;
  quantity?: number;
  price?: number;
  total: number;
  fee?: number;
  status: 'completed' | 'pending' | 'failed';
  created_at: string;
  updated_at?: string;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referred_user_id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  earnings: number;
  created_at: string;
}

export interface Watchlist {
  id: string;
  user_id: string;
  stock_id: string;
  symbol: string;
  name: string;
  current_price: number;
  added_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface DashboardStats {
  balance: number;
  portfolio_value: number;
  total_invested: number;
  total_profit: number;
  total_profit_percent: number;
  recent_transactions: Transaction[];
}

export interface AdminStats {
  total_users: number;
  active_users: number;
  new_users_this_month: number;
  total_volume: number;
  volume_growth: number;
  total_revenue: number;
  total_transactions: number;
  transactions_today: number;
  recent_users: User[];
  recent_transactions: Transaction[];
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
  page?: number;
}

export interface FilterParams {
  search?: string;
  sort_by?: string;
  order?: 'asc' | 'desc';
  date_from?: string;
  date_to?: string;
}

export type UserRole = 'user' | 'admin';
export type TransactionType = 'buy' | 'sell' | 'deposit' | 'withdrawal';
export type TransactionStatus = 'completed' | 'pending' | 'failed';
export type NotificationType = 'info' | 'warning' | 'success' | 'error';