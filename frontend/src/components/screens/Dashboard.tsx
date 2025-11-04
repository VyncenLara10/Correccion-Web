import { useState, useEffect } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  DollarSign, 
  Activity,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  FileText,
  Settings,
  ShoppingCart,
  TrendingDown,
  Eye,
  BarChart3
} from 'lucide-react';
import { StatCard } from '../common/StatCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock data for performance chart
const performanceData7Days = [
  { date: 'Lun', value: 42000 },
  { date: 'Mar', value: 43200 },
  { date: 'Mié', value: 42800 },
  { date: 'Jue', value: 44500 },
  { date: 'Vie', value: 45230 },
  { date: 'Sáb', value: 45100 },
  { date: 'Dom', value: 45800 },
];

const performanceData30Days = [
  { date: '1', value: 38000 },
  { date: '5', value: 39200 },
  { date: '10', value: 41000 },
  { date: '15', value: 40500 },
  { date: '20', value: 43000 },
  { date: '25', value: 44200 },
  { date: '30', value: 45800 },
];

const performanceData90Days = [
  { date: 'Mes 1', value: 32000 },
  { date: 'Mes 1.5', value: 35000 },
  { date: 'Mes 2', value: 38000 },
  { date: 'Mes 2.5', value: 41000 },
  { date: 'Mes 3', value: 45800 },
];

// Recent transactions
const recentTransactions = [
  { id: '1', symbol: 'AAPL', type: 'buy', shares: 10, price: 176.11, total: 1761.10, date: '2024-11-02 14:30', status: 'completed' },
  { id: '2', symbol: 'GOOGL', type: 'sell', shares: 5, price: 144.00, total: 720.00, date: '2024-11-02 10:15', status: 'completed' },
  { id: '3', symbol: 'MSFT', type: 'buy', shares: 8, price: 373.24, total: 2985.92, date: '2024-11-01 16:45', status: 'completed' },
  { id: '4', symbol: 'NVDA', type: 'buy', shares: 3, price: 875.28, total: 2625.84, date: '2024-11-01 11:20', status: 'completed' },
  { id: '5', symbol: 'TSLA', type: 'sell', shares: 6, price: 246.42, total: 1478.52, date: '2024-10-31 09:30', status: 'completed' },
];

interface DashboardProps {
  onNavigate: (route: string, data?: any) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [performancePeriod, setPerformancePeriod] = useState<'7' | '30' | '90'>('7');
  const [allStocks, setAllStocks] = useState<any[]>([]);
  const [favoriteStocks, setFavoriteStocks] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [recentTransactionsData, setRecentTransactionsData] = useState<any[]>([]);
  const [performanceChartData, setPerformanceChartData] = useState<any[]>([]);

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('tikalinvest-favorites');
    if (savedFavorites) {
      const favoriteSymbols = JSON.parse(savedFavorites) as string[];
      const favorites = allStocks.filter((stock: any) => favoriteSymbols.includes(stock.symbol));
      setFavoriteStocks(favorites);
    } else {
      // Default favorites if none saved
      setFavoriteStocks(allStocks.filter((stock: any) => ['AAPL', 'GOOGL', 'MSFT', 'TSLA'].includes(stock.symbol)));
    }
  }, [allStocks]);

  // Listen for storage changes (when favorites are added/removed from MarketCatalog)
  useEffect(() => {
    const handleStorageChange = () => {
      const savedFavorites = localStorage.getItem('tikalinvest-favorites');
      if (savedFavorites) {
        const favoriteSymbols = JSON.parse(savedFavorites) as string[];
        const favorites = allStocks.filter((stock: any) => favoriteSymbols.includes(stock.symbol));
        setFavoriteStocks(favorites);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom event from same tab
    window.addEventListener('favorites-updated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('favorites-updated', handleStorageChange);
    };
  }, [allStocks]);

  // Cargar datos de Yahoo Finance
  useEffect(() => {
    const fetchStocksData = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        const response = await fetch(`${API_BASE_URL}/stocks/popular/`);
        const data = await response.json();
        
        if (data.success && data.stocks) {
          // Convertir datos de Yahoo Finance al formato esperado
          const yahooStocks = data.stocks.map((stock: any, index: number) => ({
            id: String(index + 1),
            symbol: stock.symbol,
            name: stock.name,
            price: stock.price,
            change: stock.change,
            changePercent: stock.changePercent,
            owned: 0
          }));
          
          // Actualizar allStocks con los datos reales
          setAllStocks(yahooStocks);
          
          // Actualizar favoritos
          const savedFavorites = localStorage.getItem('tikalinvest-favorites');
          if (savedFavorites) {
            const favoriteSymbols = JSON.parse(savedFavorites) as string[];
            const favorites = yahooStocks.filter((stock: any) => favoriteSymbols.includes(stock.symbol));
            setFavoriteStocks(favorites);
          } else {
            // Establecer favoritos por defecto desde los datos de Yahoo Finance
            setFavoriteStocks(yahooStocks.slice(0, 4));
          }
        }
      } catch (error) {
        console.error('Error cargando datos de Yahoo Finance:', error);
      }
    };

    fetchStocksData();
  }, []);

  // Cargar estadísticas del dashboard desde el backend
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        const token = localStorage.getItem('access_token');
        
        if (!token) return;

        const response = await fetch(`${API_BASE_URL}/portfolio/portfolio/dashboard_stats/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        const data = await response.json();
        
        if (data.success && data.stats) {
          const stats = data.stats;
          setDashboardStats(stats);
          setRecentTransactionsData(stats.recent_transactions || []);
          setPerformanceChartData(stats.performance_data || []);
        }
      } catch (error) {
        console.error('Error cargando estadísticas del dashboard:', error);
        // Usar datos por defecto si falla
        setPerformanceChartData(performanceData7Days);
      }
    };

    fetchDashboardStats();
    
    // Recargar cada 30 segundos
    const interval = setInterval(fetchDashboardStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const performanceData = performancePeriod === '7' 
    ? performanceData7Days 
    : performancePeriod === '30' 
    ? performanceData30Days 
    : performanceData90Days;

  const handleQuickBuy = (symbol: string) => {
    onNavigate('trading', { symbol, action: 'buy' });
  };

  const handleQuickSell = (symbol: string) => {
    onNavigate('trading', { symbol, action: 'sell' });
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header with Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl text-neutral-900 mb-2">Dashboard</h1>
          <p className="text-neutral-600">
            Bienvenido de nuevo, aquí está tu resumen financiero
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => onNavigate('market')}
            className="hover:border-brand-primary hover:text-brand-primary"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Explorar Mercado
          </Button>
          <Button 
            variant="outline"
            onClick={() => onNavigate('request-report')}
            className="hover:border-brand-primary hover:text-brand-primary"
          >
            <FileText className="h-4 w-4 mr-2" />
            Solicitar Reporte
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Balance Total"
          value={dashboardStats ? `$${parseFloat(dashboardStats.total_balance).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "$0.00"}
          change={dashboardStats ? `Inversión: $${parseFloat(dashboardStats.total_invested).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "$0.00"}
          changeType="positive"
          icon={Wallet}
          iconColor="text-brand-primary"
        />
        <StatCard
          title="Ganancias Totales"
          value={dashboardStats ? `$${parseFloat(dashboardStats.total_gains).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "$0.00"}
          change={dashboardStats ? `${parseFloat(dashboardStats.gains_percentage).toFixed(2)}% de rendimiento` : "0%"}
          changeType={dashboardStats && parseFloat(dashboardStats.total_gains) >= 0 ? "positive" : "negative"}
          icon={TrendingUp}
          iconColor="text-success"
        />
        <StatCard
          title="Inversión Total"
          value={dashboardStats ? `$${parseFloat(dashboardStats.total_invested).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "$0.00"}
          change={dashboardStats ? `${dashboardStats.recent_transactions?.length || 0} transacciones` : "0 transacciones"}
          changeType="neutral"
          icon={DollarSign}
          iconColor="text-info"
        />
        <StatCard
          title="Valor del Portafolio"
          value={dashboardStats ? `$${parseFloat(dashboardStats.portfolio_value).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "$0.00"}
          change={dashboardStats && parseFloat(dashboardStats.gains_percentage) >= 0 ? `+${parseFloat(dashboardStats.gains_percentage).toFixed(2)}%` : `${parseFloat(dashboardStats?.gains_percentage || 0).toFixed(2)}%`}
          changeType={dashboardStats && parseFloat(dashboardStats.gains_percentage) >= 0 ? "positive" : "negative"}
          icon={Activity}
          iconColor="text-warning"
        />
      </div>

      {/* Performance Chart */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Rendimiento del Portafolio</CardTitle>
              <CardDescription>Evolución de tu inversión en el tiempo</CardDescription>
            </div>
            <Tabs value={performancePeriod} onValueChange={(v) => setPerformancePeriod(v as '7' | '30' | '90')}>
              <TabsList>
                <TabsTrigger value="7">7 días</TabsTrigger>
                <TabsTrigger value="30">30 días</TabsTrigger>
                <TabsTrigger value="90">90 días</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={performanceChartData.length > 0 ? performanceChartData : performanceData7Days}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px' 
                }}
                formatter={(value: any) => {
                  const val = typeof value === 'number' ? value : parseFloat(value || '0');
                  return [`$${val.toLocaleString()}`, 'Valor'];
                }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#3b82f6" 
                strokeWidth={2}
                fill="url(#colorValue)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Favorite Stocks */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-warning fill-warning" />
                <CardTitle>Acciones Favoritas</CardTitle>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onNavigate('market')}
                className="text-brand-primary hover:text-brand-primary/90"
              >
                Ver todas
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {favoriteStocks.length === 0 ? (
              <div className="text-center py-8">
                <Star className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
                <p className="text-neutral-600 mb-2">No tienes acciones favoritas</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Agrega acciones desde el mercado haciendo clic derecho
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onNavigate('market')}
                  className="border-brand-primary text-brand-primary hover:bg-brand-primary/5"
                >
                  Explorar Mercado
                </Button>
              </div>
            ) : (
              favoriteStocks.map((stock) => (
              <div 
                key={stock.id}
                className="flex items-center justify-between p-3 rounded-lg border border-neutral-200 hover:border-brand-primary hover:shadow-md transition-all group"
              >
                <div className="flex-1 min-w-0 mr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-neutral-900">{stock.symbol}</span>
                    {stock.owned > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {stock.owned} acciones
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-neutral-500 truncate">{stock.name}</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-right min-w-[90px]">
                    <p className="text-neutral-900">${stock.price.toFixed(2)}</p>
                    <div className="flex items-center justify-end gap-1">
                      {stock.changePercent >= 0 ? (
                        <ArrowUpRight className="h-3 w-3 text-success" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 text-danger" />
                      )}
                      <span className={`text-sm ${stock.changePercent >= 0 ? 'text-success' : 'text-danger'}`}>
                        {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent}%
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity min-w-[72px] justify-end">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleQuickBuy(stock.symbol)}
                      className="h-8 w-8 p-0 hover:bg-success-light hover:text-success flex-shrink-0"
                    >
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                    {stock.owned > 0 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleQuickSell(stock.symbol)}
                        className="h-8 w-8 p-0 hover:bg-danger-light hover:text-danger flex-shrink-0"
                      >
                        <ArrowDownRight className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Accesos Rápidos</CardTitle>
            <CardDescription>Accede a las funciones más utilizadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-auto py-6 flex-col gap-3 hover:border-brand-primary hover:bg-brand-primary/5"
                onClick={() => onNavigate('trading')}
              >
                <div className="w-12 h-12 rounded-full bg-success-light flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-success" />
                </div>
                <div className="text-center">
                  <p className="text-sm">Comprar</p>
                  <p className="text-xs text-muted-foreground">Acciones</p>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-auto py-6 flex-col gap-3 hover:border-brand-primary hover:bg-brand-primary/5"
                onClick={() => onNavigate('trading')}
              >
                <div className="w-12 h-12 rounded-full bg-danger-light flex items-center justify-center">
                  <TrendingDown className="h-6 w-6 text-danger" />
                </div>
                <div className="text-center">
                  <p className="text-sm">Vender</p>
                  <p className="text-xs text-muted-foreground">Acciones</p>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-auto py-6 flex-col gap-3 hover:border-brand-primary hover:bg-brand-primary/5"
                onClick={() => onNavigate('portfolio')}
              >
                <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-brand-primary" />
                </div>
                <div className="text-center">
                  <p className="text-sm">Portafolio</p>
                  <p className="text-xs text-muted-foreground">Ver inversiones</p>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-auto py-6 flex-col gap-3 hover:border-brand-primary hover:bg-brand-primary/5"
                onClick={() => onNavigate('market')}
              >
                <div className="w-12 h-12 rounded-full bg-info-light flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-info" />
                </div>
                <div className="text-center">
                  <p className="text-sm">Mercado</p>
                  <p className="text-xs text-muted-foreground">Explorar</p>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-auto py-6 flex-col gap-3 hover:border-brand-primary hover:bg-brand-primary/5"
                onClick={() => onNavigate('history')}
              >
                <div className="w-12 h-12 rounded-full bg-warning-light flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-warning" />
                </div>
                <div className="text-center">
                  <p className="text-sm">Historial</p>
                  <p className="text-xs text-muted-foreground">Transacciones</p>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-auto py-6 flex-col gap-3 hover:border-brand-primary hover:bg-brand-primary/5"
                onClick={() => onNavigate('settings')}
              >
                <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center">
                  <Settings className="h-6 w-6 text-neutral-600" />
                </div>
                <div className="text-center">
                  <p className="text-sm">Configuración</p>
                  <p className="text-xs text-muted-foreground">Cuenta</p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Historial de Transacciones</CardTitle>
              <CardDescription>Tus últimas 5 operaciones realizadas</CardDescription>
            </div>
            <Button 
              variant="ghost"
              onClick={() => onNavigate('history')}
              className="text-brand-primary hover:text-brand-primary/90"
            >
              Ver todo el historial
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Mobile View */}
          <div className="space-y-3 md:hidden">
            {recentTransactionsData.length > 0 ? (
              recentTransactionsData.map((transaction: any) => (
                <div 
                  key={transaction.id}
                  className="p-3 rounded-lg border border-neutral-200 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={transaction.transaction_type === 'buy' ? 'default' : 'secondary'}>
                        {transaction.transaction_type === 'buy' ? 'Compra' : 'Venta'}
                      </Badge>
                      <span className="text-neutral-900">{transaction.symbol}</span>
                    </div>
                    <span className={transaction.transaction_type === 'buy' ? 'text-danger' : 'text-success'}>
                      {transaction.transaction_type === 'buy' ? '-' : '+'}${parseFloat(transaction.total).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{transaction.shares} acciones @ ${parseFloat(transaction.price_per_share).toFixed(2)}</span>
                    <span>{new Date(transaction.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">No tienes transacciones aún</p>
            )}
          </div>

          {/* Desktop View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left py-3 px-4 text-sm text-muted-foreground">Tipo</th>
                  <th className="text-left py-3 px-4 text-sm text-muted-foreground">Símbolo</th>
                  <th className="text-right py-3 px-4 text-sm text-muted-foreground">Cantidad</th>
                  <th className="text-right py-3 px-4 text-sm text-muted-foreground">Precio</th>
                  <th className="text-right py-3 px-4 text-sm text-muted-foreground">Total</th>
                  <th className="text-left py-3 px-4 text-sm text-muted-foreground">Fecha</th>
                  <th className="text-center py-3 px-4 text-sm text-muted-foreground">Estado</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactionsData.length > 0 ? (
                  recentTransactionsData.map((transaction: any) => (
                    <tr 
                      key={transaction.id}
                      className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <Badge 
                          variant={transaction.transaction_type === 'buy' ? 'default' : 'secondary'}
                          className={transaction.transaction_type === 'buy' ? 'bg-success text-white' : 'bg-danger text-white'}
                        >
                          {transaction.transaction_type === 'buy' ? 'Compra' : 'Venta'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-neutral-900">{transaction.symbol}</td>
                      <td className="py-3 px-4 text-right text-neutral-900">{transaction.shares}</td>
                      <td className="py-3 px-4 text-right text-neutral-900">${parseFloat(transaction.price_per_share).toFixed(2)}</td>
                      <td className="py-3 px-4 text-right">
                        <span className={transaction.transaction_type === 'buy' ? 'text-danger' : 'text-success'}>
                          {transaction.transaction_type === 'buy' ? '-' : '+'}${parseFloat(transaction.total).toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {new Date(transaction.created_at).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="secondary" className="bg-success-light text-success">
                          {transaction.status === 'completed' ? 'Completada' : transaction.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 px-4 text-center text-muted-foreground">
                      No tienes transacciones aún
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
