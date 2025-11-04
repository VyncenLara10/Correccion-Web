import { useState, useEffect } from 'react';
import { Search, TrendingUp, TrendingDown, Plus, Minus, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { StockCard } from '../common/StockCard';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner@2.0.3';

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  sector?: string;
}

interface HistoricalDataPoint {
  date: string;
  close: number;
  open: number;
  high: number;
  low: number;
  volume: number;
}

interface CachedHistorical {
  timestamp: number;
  data: HistoricalDataPoint[];
}

interface PricePoint {
  time: string;
  price: number;
}

interface TradeTransaction {
  id: string;
  symbol: string;
  name: string;
  type: 'buy' | 'sell';
  shares: number;
  pricePerShare: number;
  total: number;
  date: string;
}

interface Portfolio {
  [symbol: string]: {
    shares: number;
    averagePrice: number;
  };
}

// Función para calcular la escala óptima del eje Y
const calculateYAxisDomain = (data: PricePoint[]): [number, number] => {
  if (!data || data.length === 0) return [0, 100];
  
  const prices = data.map(d => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const range = maxPrice - minPrice;
  
  // Si el rango es muy pequeño, añadir margen
  const padding = range < 10 ? 10 : range * 0.1;
  
  return [
    Math.max(0, minPrice - padding),
    maxPrice + padding
  ];
};

const CACHE_EXPIRATION_MS = 72 * 60 * 60 * 1000; // 72 horas en milisegundos
const HISTORICAL_CACHE_KEY = 'tikali_historical_cache';

// Función auxiliar para obtener histórico con caché
const getHistoricalDataWithCache = async (symbol: string): Promise<HistoricalDataPoint[]> => {
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  const cacheKey = `${HISTORICAL_CACHE_KEY}_${symbol}`;
  
  try {
    // Verificar si existe en caché y no ha expirado
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const cachedData: CachedHistorical = JSON.parse(cached);
      const now = Date.now();
      const age = now - cachedData.timestamp;
      
      if (age < CACHE_EXPIRATION_MS) {
        console.log(`✓ Usando caché para ${symbol} (${Math.round(age / 1000 / 60)} minutos de antigüedad)`);
        return cachedData.data;
      } else {
        console.log(`⟳ Caché expirado para ${symbol} (${Math.round(age / 1000 / 60 / 60)} horas), actualizando...`);
      }
    }
    
    // Obtener datos frescos del backend
    const response = await fetch(`${API_BASE_URL}/stocks/history/?symbol=${symbol}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success && data.historical) {
      // Guardar en caché con timestamp
      const cacheData: CachedHistorical = {
        timestamp: Date.now(),
        data: data.historical
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      console.log(`✓ Histórico actualizado para ${symbol}: ${data.historical.length} días guardados`);
      return data.historical;
    }
    
    return [];
  } catch (error) {
    console.error(`Error obteniendo histórico para ${symbol}:`, error);
    // Si falla, intentar usar caché aunque esté expirado
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const cachedData: CachedHistorical = JSON.parse(cached);
      console.log(`⚠ Usando caché expirado como fallback para ${symbol}`);
      return cachedData.data;
    }
    return [];
  }
};

// Función para convertir datos históricos a formato para el gráfico
const convertHistoricalToPricePoints = (historical: HistoricalDataPoint[]): PricePoint[] => {
  // Tomar cada 5 días para no saturar el gráfico
  const step = Math.max(1, Math.floor(historical.length / 50));
  return historical
    .filter((_, index) => index % step === 0)
    .map((point) => ({
      time: point.date,
      price: point.close
    }));
};

export function Trading() {
  const [searchQuery, setSearchQuery] = useState('');
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [shares, setShares] = useState('1');
  const [showTradeDialog, setShowTradeDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingHistorical, setIsLoadingHistorical] = useState(false);
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([]);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [portfolio, setPortfolio] = useState<Portfolio>({});
  const [transactions, setTransactions] = useState<TradeTransaction[]>([]);

  // Inicializar desde localStorage
  useEffect(() => {
    const savedBalance = localStorage.getItem('userBalance');
    const savedPortfolio = localStorage.getItem('userPortfolio');
    const savedTransactions = localStorage.getItem('userTransactions');

    if (savedBalance) setAvailableBalance(parseFloat(savedBalance));
    if (savedPortfolio) setPortfolio(JSON.parse(savedPortfolio));
    if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
  }, []);

  // Cargar datos de Yahoo Finance
  useEffect(() => {
    const fetchStocks = async () => {
      try {
        setIsLoading(true);
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        
        const response = await fetch(`${API_BASE_URL}/stocks/popular/`);
        const data = await response.json();
        
        if (data.success && data.stocks) {
          // Convertir datos de Yahoo Finance al formato esperado
          const formattedStocks = data.stocks.map((stock: any) => ({
            symbol: stock.symbol,
            name: stock.name,
            price: stock.price,
            change: stock.change,
            changePercent: stock.changePercent,
            sector: 'Mercado'
          }));
          
          setStocks(formattedStocks);
          
          // Seleccionar el primer stock por defecto
          if (formattedStocks.length > 0) {
            setSelectedStock(formattedStocks[0]);
            // Cargar histórico para el primer stock
            await loadHistoricalData(formattedStocks[0].symbol);
          }
        } else {
          toast.error('Error al cargar las acciones');
        }
      } catch (error) {
        console.error('Error cargando datos:', error);
        toast.error('Error al conectar con el servidor');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStocks();
  }, []);

  // Función para cargar datos históricos
  const loadHistoricalData = async (symbol: string) => {
    setIsLoadingHistorical(true);
    try {
      const historical = await getHistoricalDataWithCache(symbol);
      const pricePoints = convertHistoricalToPricePoints(historical);
      setPriceHistory(pricePoints);
    } catch (error) {
      console.error('Error cargando histórico:', error);
      toast.error('Error al cargar el histórico de precios');
    } finally {
      setIsLoadingHistorical(false);
    }
  };

  const filteredStocks = stocks.filter(
    (stock) =>
      stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStockClick = (stock: Stock) => {
    setSelectedStock(stock);
    setShowTradeDialog(true);
    // Cargar histórico para el stock seleccionado
    loadHistoricalData(stock.symbol);
  };

  const handleTrade = async () => {
    if (!selectedStock) return;

    const shareCount = parseFloat(shares);
    const total = shareCount * selectedStock.price;
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    const token = localStorage.getItem('access_token');

    if (!token) {
      toast.error('No autenticado', {
        description: 'Por favor inicia sesión para realizar transacciones',
      });
      return;
    }

    try {
      // Enviar transacción al backend
      const response = await fetch(`${API_BASE_URL}/portfolio/transactions/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          symbol: selectedStock.symbol,
          name: selectedStock.name,
          transaction_type: tradeType,
          shares: shareCount,
          price_per_share: selectedStock.price,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error('Error en la transacción', {
          description: data.detail || 'Ocurrió un error al procesar la transacción',
        });
        return;
      }

      // Actualizar estado local con la transacción confirmada
      const newTransaction: TradeTransaction = {
        id: data.id,
        symbol: data.symbol,
        name: data.name,
        type: data.transaction_type,
        shares: parseFloat(data.shares),
        pricePerShare: parseFloat(data.price_per_share),
        total: parseFloat(data.total),
        date: new Date(data.created_at).toLocaleString('es-ES'),
      };

      const newTransactions = [newTransaction, ...transactions];
      setTransactions(newTransactions);
      localStorage.setItem('userTransactions', JSON.stringify(newTransactions));

      if (tradeType === 'buy') {
        // Actualizar portafolio
        const newPortfolio = { ...portfolio };
        if (newPortfolio[selectedStock.symbol]) {
          const current = newPortfolio[selectedStock.symbol];
          const totalShares = current.shares + shareCount;
          const totalInvested = (current.shares * current.averagePrice) + total;
          newPortfolio[selectedStock.symbol] = {
            shares: totalShares,
            averagePrice: totalInvested / totalShares,
          };
        } else {
          newPortfolio[selectedStock.symbol] = {
            shares: shareCount,
            averagePrice: selectedStock.price,
          };
        }
        setPortfolio(newPortfolio);
        localStorage.setItem('userPortfolio', JSON.stringify(newPortfolio));

        // Actualizar balance
        const newBalance = availableBalance - total;
        setAvailableBalance(newBalance);
        localStorage.setItem('userBalance', newBalance.toString());

        toast.success('Compra exitosa', {
          description: `${shareCount} acciones de ${selectedStock.symbol} por $${total.toFixed(2)}`,
        });
      } else {
        // Lógica para vender
        const newPortfolio = { ...portfolio };
        if (newPortfolio[selectedStock.symbol]) {
          newPortfolio[selectedStock.symbol].shares -= shareCount;
          if (newPortfolio[selectedStock.symbol].shares === 0) {
            delete newPortfolio[selectedStock.symbol];
          }
        }
        setPortfolio(newPortfolio);
        localStorage.setItem('userPortfolio', JSON.stringify(newPortfolio));

        // Actualizar balance
        const newBalance = availableBalance + total;
        setAvailableBalance(newBalance);
        localStorage.setItem('userBalance', newBalance.toString());

        toast.success('Venta exitosa', {
          description: `${shareCount} acciones de ${selectedStock.symbol} por $${total.toFixed(2)}`,
        });
      }

      setShowTradeDialog(false);
      setShares('1');
    } catch (error) {
      console.error('Error en la transacción:', error);
      toast.error('Error de conexión', {
        description: 'No se pudo procesar la transacción. Verifica tu conexión',
      });
    }
  };

  const calculateTotal = () => {
    if (!selectedStock) return 0;
    return parseFloat(shares || '0') * selectedStock.price;
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card className="border-border">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar acciones por símbolo o nombre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-input-background"
            />
          </div>
        </CardContent>
      </Card>

      {/* Market Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">S&P 500</p>
                <p className="text-2xl text-neutral-900 mt-1">4,567.89</p>
              </div>
              <div className="flex items-center gap-1 text-success">
                <TrendingUp className="h-5 w-5" />
                <span>+1.25%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">NASDAQ</p>
                <p className="text-2xl text-neutral-900 mt-1">14,234.56</p>
              </div>
              <div className="flex items-center gap-1 text-success">
                <TrendingUp className="h-5 w-5" />
                <span>+0.85%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">DOW JONES</p>
                <p className="text-2xl text-neutral-900 mt-1">35,678.90</p>
              </div>
              <div className="flex items-center gap-1 text-danger">
                <TrendingDown className="h-5 w-5" />
                <span>-0.32%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stocks List */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Acciones Disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <span className="ml-2 text-muted-foreground">Cargando acciones...</span>
            </div>
          ) : filteredStocks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No se encontraron acciones</p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredStocks.map((stock) => (
                <StockCard
                  key={stock.symbol}
                  {...stock}
                  onClick={() => handleStockClick(stock)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trade Dialog */}
      <Dialog open={showTradeDialog} onOpenChange={setShowTradeDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedStock?.symbol} - {selectedStock?.name}
            </DialogTitle>
            <DialogDescription>
              Precio actual: ${selectedStock?.price.toFixed(2)}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Price Chart */}
            <div className="h-48">
              {isLoadingHistorical ? (
                <div className="flex items-center justify-center h-full bg-neutral-50 rounded-lg border border-border">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                    <p className="text-sm text-muted-foreground">Cargando histórico...</p>
                  </div>
                </div>
              ) : priceHistory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={priceHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
                    <YAxis 
                      stroke="#64748b" 
                      fontSize={12}
                      domain={calculateYAxisDomain(priceHistory)}
                      label={{ value: 'Precio ($)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px' 
                      }}
                      formatter={(value: any) => `$${typeof value === 'number' ? value.toFixed(2) : value}`}
                      labelFormatter={(label: any) => `Fecha: ${label}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full bg-neutral-50 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground">No hay datos disponibles</p>
                </div>
              )}
            </div>

            {/* Trade Form */}
            <Tabs value={tradeType} onValueChange={(v) => setTradeType(v as 'buy' | 'sell')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="buy" className="data-[state=active]:bg-success data-[state=active]:text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Comprar
                </TabsTrigger>
                <TabsTrigger value="sell" className="data-[state=active]:bg-danger data-[state=active]:text-white">
                  <Minus className="h-4 w-4 mr-2" />
                  Vender
                </TabsTrigger>
              </TabsList>

              <TabsContent value="buy" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="buy-shares">Cantidad de Acciones</Label>
                  <Input
                    id="buy-shares"
                    type="number"
                    min="1"
                    value={shares}
                    onChange={(e) => setShares(e.target.value)}
                    className="bg-input-background"
                  />
                </div>
                <div className="rounded-lg bg-neutral-100 p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Precio por acción</span>
                    <span className="text-neutral-900">${selectedStock?.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cantidad</span>
                    <span className="text-neutral-900">{shares}</span>
                  </div>
                  <div className="h-px bg-border my-2" />
                  <div className="flex justify-between">
                    <span>Total</span>
                    <span className="text-neutral-900">${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
                <Button 
                  className="w-full bg-success hover:bg-success/90 text-white" 
                  onClick={handleTrade}
                >
                  Confirmar Compra
                </Button>
              </TabsContent>

              <TabsContent value="sell" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="sell-shares">Cantidad de Acciones</Label>
                  <Input
                    id="sell-shares"
                    type="number"
                    min="1"
                    value={shares}
                    onChange={(e) => setShares(e.target.value)}
                    className="bg-input-background"
                  />
                  <p className="text-sm text-muted-foreground">Disponibles: {portfolio[selectedStock?.symbol || '']?.shares || 0} acciones</p>
                </div>
                <div className="rounded-lg bg-neutral-100 p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Precio por acción</span>
                    <span className="text-neutral-900">${selectedStock?.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cantidad</span>
                    <span className="text-neutral-900">{shares}</span>
                  </div>
                  <div className="h-px bg-border my-2" />
                  <div className="flex justify-between">
                    <span>Total</span>
                    <span className="text-neutral-900">${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
                <Button 
                  className="w-full bg-danger hover:bg-danger/90 text-white" 
                  onClick={handleTrade}
                >
                  Confirmar Venta
                </Button>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
