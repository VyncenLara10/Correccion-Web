'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatCurrency, formatPercent, getChangeColor, getChangeBgColor } from '@/lib/utils';
import { TrendingUp, TrendingDown, Wallet, Briefcase, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [trendingStocks, setTrendingStocks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [statsData, portfolioData, transactionsData, trendingData] = await Promise.all([
        api.getTransactionStats(),
        api.getPortfolio(),
        api.getTransactions({ limit: 5 }),
        api.getTrendingStocks(),
      ]);

      setStats(statsData);
      setPortfolio(portfolioData.results || portfolioData);
      setTransactions(transactionsData.results || transactionsData);
      setTrendingStocks(trendingData);
    } catch (error) {
      toast.error('Error al cargar datos del dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const profitLossPercent = stats?.total_invested > 0 
    ? (stats.total_profit_loss / stats.total_invested) * 100 
    : 0;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Bienvenido, {user?.full_name.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-400">Aquí está el resumen de tu portafolio hoy</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Balance Total</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(stats?.total_assets || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-500/10 rounded-full flex items-center justify-center">
                <Wallet className="w-6 h-6 text-primary-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Valor del Portafolio</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(stats?.portfolio_value || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-500/10 rounded-full flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-primary-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Ganancias/Pérdidas</p>
                <p className={`text-2xl font-bold ${getChangeColor(stats?.total_profit_loss || 0)}`}>
                  {formatCurrency(stats?.total_profit_loss || 0)}
                </p>
                <p className={`text-sm ${getChangeColor(profitLossPercent)}`}>
                  {profitLossPercent > 0 ? '+' : ''}{profitLossPercent.toFixed(2)}%
                </p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                (stats?.total_profit_loss || 0) >= 0 ? 'bg-success-DEFAULT/10' : 'bg-danger-DEFAULT/10'
              }`}>
                {(stats?.total_profit_loss || 0) >= 0 ? (
                  <TrendingUp className="w-6 h-6 text-success-DEFAULT" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-danger-DEFAULT" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Transacciones</p>
                <p className="text-2xl font-bold text-white">
                  {stats?.total_transactions || 0}
                </p>
                <p className="text-sm text-gray-400">
                  {stats?.total_buys || 0} compras · {stats?.total_sells || 0} ventas
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-500/10 rounded-full flex items-center justify-center">
                <Activity className="w-6 h-6 text-primary-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portfolio */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Mi Portafolio</CardTitle>
              <Link href="/dashboard/portfolio" className="text-sm text-primary-500 hover:text-primary-400">
                Ver todo →
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {portfolio.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No tienes acciones aún</p>
                <Link href="/dashboard/market" className="text-primary-500 hover:text-primary-400 text-sm mt-2 inline-block">
                  Explorar mercado
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {portfolio.slice(0, 5).map((position: any) => (
                  <div key={position.id} className="flex items-center justify-between py-3 border-b border-gray-700 last:border-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-500/10 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-bold text-primary-500">
                          {position.stock.symbol.substring(0, 2)}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-white">{position.stock.symbol}</p>
                        <p className="text-sm text-gray-400">{position.quantity} acciones</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-white">{formatCurrency(position.current_value)}</p>
                      <p className={`text-sm ${getChangeColor(position.profit_loss)}`}>
                        {position.profit_loss >= 0 ? '+' : ''}{formatCurrency(position.profit_loss)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Transacciones Recientes</CardTitle>
              <Link href="/dashboard/transactions" className="text-sm text-primary-500 hover:text-primary-400">
                Ver todas →
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No hay transacciones aún</p>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((tx: any) => (
                  <div key={tx.id} className="flex items-center justify-between py-3 border-b border-gray-700 last:border-0">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        tx.transaction_type === 'buy' ? 'bg-success-DEFAULT/10' : 'bg-danger-DEFAULT/10'
                      }`}>
                        {tx.transaction_type === 'buy' ? (
                          <ArrowDownRight className="w-5 h-5 text-success-DEFAULT" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5 text-danger-DEFAULT" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-white">
                          {tx.transaction_type === 'buy' ? 'Compra' : 'Venta'} {tx.stock_detail.symbol}
                        </p>
                        <p className="text-sm text-gray-400">
                          {tx.quantity} acciones · {formatCurrency(tx.price_per_share)}/acción
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        tx.transaction_type === 'buy' ? 'text-danger-DEFAULT' : 'text-success-DEFAULT'
                      }`}>
                        {tx.transaction_type === 'buy' ? '-' : '+'}{formatCurrency(tx.total_amount)}
                      </p>
                      <p className="text-sm text-gray-400">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Trending Stocks */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Acciones en Tendencia</CardTitle>
            <Link href="/dashboard/market" className="text-sm text-primary-500 hover:text-primary-400">
              Ver mercado →
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {trendingStocks.slice(0, 4).map((stock: any) => (
              <Link
                key={stock.id}
                href={`/dashboard/market/${stock.symbol}`}
                className="p-4 bg-gray-900/50 rounded-lg border border-gray-700 hover:border-primary-500 transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-white">{stock.symbol}</span>
                  <span className={`text-xs px-2 py-1 rounded ${getChangeBgColor(stock.change_percent)}`}>
                    {stock.change_percent >= 0 ? '+' : ''}{stock.change_percent.toFixed(2)}%
                  </span>
                </div>
                <p className="text-sm text-gray-400 mb-2">{stock.name}</p>
                <p className="text-lg font-bold text-white">{formatCurrency(stock.current_price)}</p>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/dashboard/wallet?action=deposit"
          className="p-6 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl hover:scale-105 transition"
        >
          <Wallet className="w-8 h-8 text-white mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">Depositar Fondos</h3>
          <p className="text-sm text-primary-100">Agrega dinero a tu cuenta</p>
        </Link>

        <Link
          href="/dashboard/market"
          className="p-6 bg-gradient-to-br from-success-DEFAULT to-success-dark rounded-xl hover:scale-105 transition"
        >
          <TrendingUp className="w-8 h-8 text-white mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">Explorar Mercado</h3>
          <p className="text-sm text-success-light">Busca acciones para invertir</p>
        </Link>

        <Link
          href="/dashboard/reports"
          className="p-6 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl hover:scale-105 transition"
        >
          <Activity className="w-8 h-8 text-white mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">Ver Reportes</h3>
          <p className="text-sm text-gray-300">Analiza tu desempeño</p>
        </Link>
      </div>
    </div>
  );
}