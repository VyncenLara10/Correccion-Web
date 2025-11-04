import { useState, useEffect } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Legend, 
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Separator } from '../ui/separator';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  DollarSign,
  Activity,
  ExternalLink,
  ShoppingCart,
  Clock
} from 'lucide-react';

// Mock data - será reemplazado con datos reales del localStorage
let portfolioHoldings: any[] = [];

// Mock intraday data
const intradayData = [
  { time: '09:30', price: 176.20 },
  { time: '10:00', price: 177.10 },
  { time: '10:30', price: 176.80 },
  { time: '11:00', price: 177.50 },
  { time: '11:30', price: 178.20 },
  { time: '12:00', price: 177.90 },
  { time: '12:30', price: 178.60 },
  { time: '13:00', price: 178.45 },
];

// Mock historical data
const historicalData = [
  { date: '15 Oct', price: 165.30 },
  { date: '22 Oct', price: 168.50 },
  { date: '29 Oct', price: 172.80 },
  { date: '05 Nov', price: 175.20 },
  { date: '12 Nov', price: 173.90 },
  { date: '19 Nov', price: 176.40 },
  { date: '26 Nov', price: 178.45 },
];

// Mock news
const mockNews = [
  {
    id: '1',
    title: 'Apple reporta ganancias récord en el último trimestre',
    source: 'Bloomberg',
    time: 'Hace 2 horas',
    sentiment: 'positive',
  },
  {
    id: '2',
    title: 'Nuevos productos de Apple esperados para el próximo año',
    source: 'TechCrunch',
    time: 'Hace 5 horas',
    sentiment: 'neutral',
  },
  {
    id: '3',
    title: 'Análisis: Apple mantiene posición dominante en mercado premium',
    source: 'Wall Street Journal',
    time: 'Hace 1 día',
    sentiment: 'positive',
  },
];

// Mock open orders
const mockOrders = [
  {
    id: '1',
    type: 'buy',
    shares: 10,
    price: 175.00,
    status: 'pending',
    date: '2024-11-02 14:30',
  },
  {
    id: '2',
    type: 'sell',
    shares: 5,
    price: 180.00,
    status: 'pending',
    date: '2024-11-01 10:15',
  },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

interface PortfolioProps {
  onNavigate?: (route: string, data?: any) => void;
}

export function Portfolio({ onNavigate }: PortfolioProps) {
  const [selectedAsset, setSelectedAsset] = useState<typeof portfolioHoldings[0] | null>(null);
  const [chartPeriod, setChartPeriod] = useState<'intraday' | 'historical'>('intraday');
  const [isLoading, setIsLoading] = useState(true);
  const [allocationData, setAllocationData] = useState<any[]>([]);

  // Cargar datos reales del localStorage y backend
  useEffect(() => {
    loadPortfolioData();
  }, []);

  const loadPortfolioData = async () => {
    try {
      setIsLoading(true);
      
      // Cargar portafolio del localStorage
      const savedPortfolio = localStorage.getItem('userPortfolio');
      if (!savedPortfolio) {
        setIsLoading(false);
        return;
      }

      const userPortfolio = JSON.parse(savedPortfolio);
      
      // Cargar precios actuales del backend
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const response = await fetch(`${API_BASE_URL}/stocks/popular/`);
      const data = await response.json();

      if (data.success && data.stocks) {
        const stockMap = new Map(data.stocks.map((s: any) => [s.symbol, s]));
        
        // Construir holdings con datos reales
        const calculatedHoldings = Object.entries(userPortfolio).map(
          ([symbol, position]: [string, any], index) => {
            const stock = stockMap.get(symbol);
            const currentPrice = stock?.price || position.averagePrice;
            const name = stock?.name || symbol;
            const investedTotal = position.shares * position.averagePrice;
            const currentTotal = position.shares * currentPrice;
            const gainLoss = currentTotal - investedTotal;
            const gainLossPercent = (gainLoss / investedTotal) * 100;

            return {
              id: `${index}`,
              symbol,
              name,
              shares: position.shares,
              avgPrice: position.averagePrice,
              currentPrice,
              totalValue: currentTotal,
              gainLoss,
              gainLossPercent,
              allocation: 0,
            };
          }
        );

        // Calcular asignación
        const totalVal = calculatedHoldings.reduce((sum, h) => sum + h.totalValue, 0);
        calculatedHoldings.forEach((h) => {
          h.allocation = (h.totalValue / totalVal) * 100;
        });

        portfolioHoldings = calculatedHoldings;
        
        // Actualizar datos para la gráfica de pastel
        const pieData = calculatedHoldings.map(holding => ({
          name: holding.symbol,
          value: holding.totalValue,
        }));
        setAllocationData(pieData);
      }
    } catch (error) {
      console.error('Error cargando portafolio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalValue = portfolioHoldings.reduce((sum, h) => sum + h.totalValue, 0);
  const totalGainLoss = portfolioHoldings.reduce((sum, h) => sum + h.gainLoss, 0);
  const totalGainLossPercent = totalValue > 0 ? (totalGainLoss / (totalValue - totalGainLoss)) * 100 : 0;
  const isProfit = totalGainLoss >= 0;

  const handleAssetClick = (holding: typeof portfolioHoldings[0]) => {
    setSelectedAsset(holding);
  };

  const handleBuySell = (action: 'buy' | 'sell') => {
    setSelectedAsset(null);
    onNavigate?.('trading', { symbol: selectedAsset?.symbol, action });
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl text-neutral-900 mb-2">Mi Portafolio</h1>
        <p className="text-neutral-600">
          Gestiona tus inversiones y monitorea el rendimiento de tus activos
        </p>
      </div>

      {portfolioHoldings.length === 0 ? (
        <Card className="border-border">
          <CardContent className="p-12 text-center">
            <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No tienes inversiones aún. Comienza comprando acciones en la sección Trading.
            </p>
            <Button className="mt-4 bg-brand-primary" onClick={() => onNavigate?.('trading')}>
              Ir a Trading
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-brand-primary" />
              </div>
              <p className="text-sm text-muted-foreground">Valor Total del Portafolio</p>
            </div>
            <h2 className="text-2xl text-neutral-900 mb-2">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
            <div className={`flex items-center gap-1 ${isProfit ? 'text-success' : 'text-danger'}`}>
              {isProfit ? (
                <ArrowUpRight className="h-4 w-4" />
              ) : (
                <ArrowDownRight className="h-4 w-4" />
              )}
              <span className="text-sm">
                {isProfit ? '+' : ''}${Math.abs(totalGainLoss).toFixed(2)} ({isProfit ? '+' : ''}{totalGainLossPercent.toFixed(2)}%)
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-info-light flex items-center justify-center">
                <Activity className="h-5 w-5 text-info" />
              </div>
              <p className="text-sm text-muted-foreground">Inversión Total</p>
            </div>
            <h2 className="text-2xl text-neutral-900 mb-2">${(totalValue - totalGainLoss).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
            <p className="text-sm text-muted-foreground">
              Capital invertido
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-success-light flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-success" />
              </div>
              <p className="text-sm text-muted-foreground">Posiciones Activas</p>
            </div>
            <h2 className="text-2xl text-neutral-900 mb-2">{portfolioHoldings.length}</h2>
            <p className="text-sm text-muted-foreground">
              Acciones en cartera
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Allocation Chart */}
        <Card className="border-border lg:col-span-1">
          <CardHeader>
            <CardTitle>Distribución de Activos</CardTitle>
            <CardDescription>Porcentaje de tu portafolio por acción</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={allocationData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {allocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => `$${value.toFixed(2)}`}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px' 
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Holdings List */}
        <Card className="border-border lg:col-span-2">
          <CardHeader>
            <CardTitle>Mis Inversiones</CardTitle>
            <CardDescription>Click en cualquier activo para ver detalles</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Mobile View */}
            <div className="space-y-3 md:hidden">
              {portfolioHoldings.map((holding) => {
                const isGain = holding.gainLoss >= 0;
                return (
                  <div 
                    key={holding.id}
                    onClick={() => handleAssetClick(holding)}
                    className="p-4 rounded-lg border border-neutral-200 hover:border-brand-primary hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-neutral-900 mb-1">{holding.symbol}</p>
                        <p className="text-sm text-muted-foreground">{holding.shares} acciones</p>
                      </div>
                      <Badge variant={isGain ? 'default' : 'secondary'} className={isGain ? 'bg-success text-white' : 'bg-danger text-white'}>
                        {isGain ? '+' : ''}{holding.gainLossPercent.toFixed(2)}%
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Precio medio</p>
                        <p className="text-neutral-900">${holding.avgPrice.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Precio actual</p>
                        <p className="text-neutral-900">${holding.currentPrice.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Valor total</p>
                        <p className="text-neutral-900">${holding.totalValue.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Ganancia/Pérdida</p>
                        <p className={isGain ? 'text-success' : 'text-danger'}>
                          {isGain ? '+' : ''}${holding.gainLoss.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="text-left py-3 px-4 text-sm text-muted-foreground">Activo</th>
                    <th className="text-right py-3 px-4 text-sm text-muted-foreground">Cantidad</th>
                    <th className="text-right py-3 px-4 text-sm text-muted-foreground">Precio Medio</th>
                    <th className="text-right py-3 px-4 text-sm text-muted-foreground">Precio Actual</th>
                    <th className="text-right py-3 px-4 text-sm text-muted-foreground">Valor Total</th>
                    <th className="text-right py-3 px-4 text-sm text-muted-foreground">Ganancia/Pérdida</th>
                    <th className="text-center py-3 px-4 text-sm text-muted-foreground">%</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolioHoldings.map((holding) => {
                    const isGain = holding.gainLoss >= 0;
                    return (
                      <tr 
                        key={holding.id}
                        onClick={() => handleAssetClick(holding)}
                        className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors cursor-pointer"
                      >
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-neutral-900">{holding.symbol}</p>
                            <p className="text-sm text-muted-foreground">{holding.name}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right text-neutral-900">{holding.shares}</td>
                        <td className="py-3 px-4 text-right text-neutral-900">${holding.avgPrice.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right text-neutral-900">${holding.currentPrice.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right text-neutral-900">${holding.totalValue.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right">
                          <span className={isGain ? 'text-success' : 'text-danger'}>
                            {isGain ? '+' : ''}${holding.gainLoss.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge 
                            variant={isGain ? 'default' : 'secondary'}
                            className={isGain ? 'bg-success text-white' : 'bg-danger text-white'}
                          >
                            {isGain ? '+' : ''}{holding.gainLossPercent.toFixed(2)}%
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Asset Detail Dialog */}
      <Dialog open={!!selectedAsset} onOpenChange={() => setSelectedAsset(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedAsset && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl text-neutral-900">{selectedAsset.symbol}</h2>
                    <p className="text-sm text-muted-foreground mt-1">{selectedAsset.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl text-neutral-900">${selectedAsset.currentPrice.toFixed(2)}</p>
                    <div className={`flex items-center gap-1 justify-end ${selectedAsset.gainLoss >= 0 ? 'text-success' : 'text-danger'}`}>
                      {selectedAsset.gainLoss >= 0 ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                      <span className="text-sm">
                        {selectedAsset.gainLoss >= 0 ? '+' : ''}${selectedAsset.gainLoss.toFixed(2)} ({selectedAsset.gainLoss >= 0 ? '+' : ''}{selectedAsset.gainLossPercent.toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Position Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-neutral-50 rounded-lg">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Acciones</p>
                    <p className="text-lg text-neutral-900">{selectedAsset.shares}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Precio Medio</p>
                    <p className="text-lg text-neutral-900">${selectedAsset.avgPrice.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Valor Total</p>
                    <p className="text-lg text-neutral-900">${selectedAsset.totalValue.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Ganancia/Pérdida</p>
                    <p className={`text-lg ${selectedAsset.gainLoss >= 0 ? 'text-success' : 'text-danger'}`}>
                      {selectedAsset.gainLoss >= 0 ? '+' : ''}${selectedAsset.gainLoss.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Chart */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-neutral-900">Gráfico de Precios</h3>
                    <Tabs value={chartPeriod} onValueChange={(v) => setChartPeriod(v as 'intraday' | 'historical')}>
                      <TabsList>
                        <TabsTrigger value="intraday">Intradía</TabsTrigger>
                        <TabsTrigger value="historical">Histórico</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  <div className="h-64 border border-neutral-200 rounded-lg p-4">
                    <ResponsiveContainer width="100%" height="100%">
                      {chartPeriod === 'intraday' ? (
                        <AreaChart data={intradayData}>
                          <defs>
                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
                          <YAxis stroke="#64748b" fontSize={12} domain={['dataMin - 1', 'dataMax + 1']} />
                          <Tooltip 
                            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Precio']}
                            contentStyle={{ 
                              backgroundColor: 'white', 
                              border: '1px solid #e2e8f0',
                              borderRadius: '8px' 
                            }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="price" 
                            stroke="#3b82f6" 
                            strokeWidth={2}
                            fill="url(#colorPrice)" 
                          />
                        </AreaChart>
                      ) : (
                        <LineChart data={historicalData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                          <YAxis stroke="#64748b" fontSize={12} domain={['dataMin - 5', 'dataMax + 5']} />
                          <Tooltip 
                            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Precio']}
                            contentStyle={{ 
                              backgroundColor: 'white', 
                              border: '1px solid #e2e8f0',
                              borderRadius: '8px' 
                            }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="price" 
                            stroke="#3b82f6" 
                            strokeWidth={2}
                            dot={{ fill: '#3b82f6', r: 4 }}
                          />
                        </LineChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* News and Orders */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* News */}
                  <div>
                    <h3 className="text-neutral-900 mb-3">Noticias Relacionadas</h3>
                    <div className="space-y-3">
                      {mockNews.map((news) => (
                        <div 
                          key={news.id}
                          className="p-3 border border-neutral-200 rounded-lg hover:border-brand-primary hover:shadow-sm transition-all cursor-pointer group"
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className="text-sm text-neutral-900 group-hover:text-brand-primary transition-colors line-clamp-2">
                              {news.title}
                            </h4>
                            <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">{news.source}</p>
                            <p className="text-xs text-muted-foreground">{news.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Open Orders */}
                  <div>
                    <h3 className="text-neutral-900 mb-3">Órdenes Abiertas</h3>
                    {mockOrders.length > 0 ? (
                      <div className="space-y-3">
                        {mockOrders.map((order) => (
                          <div 
                            key={order.id}
                            className="p-3 border border-neutral-200 rounded-lg"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <Badge 
                                variant={order.type === 'buy' ? 'default' : 'secondary'}
                                className={order.type === 'buy' ? 'bg-success text-white' : 'bg-danger text-white'}
                              >
                                {order.type === 'buy' ? 'Compra' : 'Venta'}
                              </Badge>
                              <Badge variant="secondary" className="bg-warning-light text-warning">
                                <Clock className="h-3 w-3 mr-1" />
                                Pendiente
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <p className="text-muted-foreground">Cantidad</p>
                                <p className="text-neutral-900">{order.shares} acciones</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Precio</p>
                                <p className="text-neutral-900">${order.price.toFixed(2)}</p>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(order.date).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center border border-dashed border-neutral-300 rounded-lg">
                        <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No hay órdenes abiertas</p>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button 
                    className="flex-1 bg-success hover:bg-success/90"
                    onClick={() => handleBuySell('buy')}
                  >
                    <ArrowUpRight className="h-4 w-4 mr-2" />
                    Comprar Más
                  </Button>
                  <Button 
                    className="flex-1 bg-danger hover:bg-danger/90"
                    onClick={() => handleBuySell('sell')}
                  >
                    <ArrowDownRight className="h-4 w-4 mr-2" />
                    Vender Acciones
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
        </>
      )}
    </div>
  );
}
