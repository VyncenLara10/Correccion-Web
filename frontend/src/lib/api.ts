import axios, { AxiosError, AxiosInstance } from 'axios';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para agregar token
    this.client.interceptors.request.use(
      (config) => {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('access_token');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Interceptor para manejar respuestas
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // Si el token expiró, intentar refrescarlo
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
              const response = await axios.post(`${API_URL}/auth/refresh/`, {
                refresh: refreshToken,
              });

              const { access } = response.data;
              localStorage.setItem('access_token', access);

              originalRequest.headers.Authorization = `Bearer ${access}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // Si falla el refresh, limpiar tokens y redirigir al login
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        // Mostrar mensaje de error
        if (error.response?.data) {
          const data = error.response.data as any;
          const message = data.detail || data.message || 'Ocurrió un error';
          toast.error(message);
        }

        return Promise.reject(error);
      }
    );
  }

  // Auth
  async register(data: RegisterData) {
    const response = await this.client.post('/auth/register/', data);
    return response.data;
  }

  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login/', { email, password });
    const { tokens, user } = response.data;
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
      localStorage.setItem('user', JSON.stringify(user));
    }
    
    return response.data;
  }

  async logout() {
    await this.client.post('/auth/logout/');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  }

  // Users
  async getMe() {
    const response = await this.client.get('/users/me/');
    return response.data;
  }

  async updateProfile(data: any) {
    const response = await this.client.put('/users/update_profile/', data);
    return response.data;
  }

  async getReferrals() {
    const response = await this.client.get('/users/referrals/');
    return response.data;
  }

  // Stocks
  async getStocks(params?: any) {
    const response = await this.client.get('/stocks/', { params });
    return response.data;
  }

  async getStock(id: string) {
    const response = await this.client.get(`/stocks/${id}/`);
    return response.data;
  }

  async getStockHistory(id: string, interval = '1d', limit = 30) {
    const response = await this.client.get(`/stocks/${id}/history/`, {
      params: { interval, limit }
    });
    return response.data;
  }

  async getTrendingStocks() {
    const response = await this.client.get('/stocks/trending/');
    return response.data;
  }

  async getGainers() {
    const response = await this.client.get('/stocks/gainers/');
    return response.data;
  }

  async getLosers() {
    const response = await this.client.get('/stocks/losers/');
    return response.data;
  }

  async getStockCategories() {
    const response = await this.client.get('/stock-categories/');
    return response.data;
  }

  // Watchlist
  async getWatchlist() {
    const response = await this.client.get('/watchlist/');
    return response.data;
  }

  async toggleWatchlist(stockId: string) {
    const response = await this.client.post('/watchlist/toggle/', { stock_id: stockId });
    return response.data;
  }

  // Transactions
  async createTransaction(data: TransactionData) {
    const response = await this.client.post('/transactions/', data);
    return response.data;
  }

  async getTransactions(params?: any) {
    const response = await this.client.get('/transactions/', { params });
    return response.data;
  }

  async getTransactionStats() {
    const response = await this.client.get('/transactions/stats/');
    return response.data;
  }

  // Portfolio
  async getPortfolio() {
    const response = await this.client.get('/portfolio/');
    return response.data;
  }

  async getPortfolioSummary() {
    const response = await this.client.get('/portfolio/summary/');
    return response.data;
  }

  // Wallet
  async deposit(data: DepositData) {
    const response = await this.client.post('/wallet/deposit/', data);
    return response.data;
  }

  async withdrawal(data: WithdrawalData) {
    const response = await this.client.post('/wallet/withdrawal/', data);
    return response.data;
  }

  async getWalletTransactions(params?: any) {
    const response = await this.client.get('/wallet/', { params });
    return response.data;
  }

  // Reports
  async requestReport(data: ReportData) {
    const response = await this.client.post('/reports/', data);
    return response.data;
  }

  async getReports() {
    const response = await this.client.get('/reports/');
    return response.data;
  }

  // Admin
  async getUsers(params?: any) {
    const response = await this.client.get('/users/', { params });
    return response.data;
  }

  async approveUser(userId: string) {
    const response = await this.client.post(`/users/${userId}/approve/`);
    return response.data;
  }

  async suspendUser(userId: string) {
    const response = await this.client.post(`/users/${userId}/suspend/`);
    return response.data;
  }

  async activateUser(userId: string) {
    const response = await this.client.post(`/users/${userId}/activate/`);
    return response.data;
  }

  async createStock(data: any) {
    const response = await this.client.post('/stocks/', data);
    return response.data;
  }

  async updateStock(id: string, data: any) {
    const response = await this.client.patch(`/stocks/${id}/`, data);
    return response.data;
  }

  async deleteStock(id: string) {
    const response = await this.client.delete(`/stocks/${id}/`);
    return response.data;
  }
}

// Types
export interface RegisterData {
  email: string;
  username: string;
  password: string;
  password_confirm: string;
  full_name: string;
  phone?: string;
  date_of_birth?: string;
  address?: string;
  country?: string;
  id_document?: string;
  id_document_type?: string;
  referral_code_used?: string;
}

export interface TransactionData {
  stock_id: string;
  transaction_type: 'buy' | 'sell';
  quantity: number;
}

export interface DepositData {
  amount: number;
  bank_name: string;
  account_number?: string;
}

export interface WithdrawalData {
  amount: number;
  bank_name: string;
  account_number: string;
}

export interface ReportData {
  report_type: 'transaction_history' | 'profit_loss' | 'portfolio_summary';
  start_date: string;
  end_date: string;
}

export const api = new ApiClient();
export default api;