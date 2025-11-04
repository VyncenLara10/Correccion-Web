import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Star, 
  ShoppingCart,
  BarChart3,
  Activity,
  DollarSign,
  Calendar,
  Users,
  Building2,
  Globe,
  Info,
  ChevronDown,
  ChevronUp,
  Loader2
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { toast } from 'sonner@2.0.3';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface StockDetailProps {
  symbol: string;
  onBack: () => void;
}

export function StockDetail({ symbol, onBack }: StockDetailProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [stockDetail, setStockDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch stock detail on mount
  useEffect(() => {
    const fetchStockDetail = async () => {
      try {
        setLoading(true);
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        const response = await fetch(`${API_BASE_URL}/stocks/detail/?symbol=${symbol}`);
        const data = await response.json();
        
        if (data.success && data.stock) {
          setStockDetail(data.stock);
        } else {
          toast.error('Error al cargar datos del stock');
        }
      } catch (error) {
        console.error('Error fetching stock detail:', error);
        toast.error('Error al conectar con el servidor');
      } finally {
        setLoading(false);
      }
    };

    if (symbol) {
      fetchStockDetail();
    }

    // Cleanup: clear stockDetail when component unmounts
    return () => {
      setStockDetail(null);
    };
  }, [symbol]);
  // Load favorites from localStorage
  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('tikalinvest-favorites') || '[]');
    setIsFavorite(favorites.includes(symbol));
  }, [symbol]);

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('tikalinvest-favorites') || '[]');
    let newFavorites;
    
    if (isFavorite) {
      newFavorites = favorites.filter((s: string) => s !== symbol);
      toast.success('Eliminado de favoritos', {
        description: `${symbol} ha sido eliminado de tus favoritos`
      });
    } else {
      newFavorites = [...favorites, symbol];
      toast.success('Agregado a favoritos', {
        description: `${symbol} ha sido agregado a tus favoritos`
      });
    }
    
    localStorage.setItem('tikalinvest-favorites', JSON.stringify(newFavorites));
    setIsFavorite(!isFavorite);
  };

  const handleBuy = () => {
    toast.success('Redirigiendo a Trading', {
      description: `Preparando orden de compra para ${symbol}`
    });
  };

  // Show loading spinner while fetching data
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
      </div>
    );
  }

  // Show error if no data loaded
  if (!stockDetail) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <p className="text-muted-foreground">No se pudo cargar la información del stock</p>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="hover:bg-neutral-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-neutral-900">{stockDetail.symbol}</h1>
            {stockDetail.sector && (
              <Badge variant="outline" className="border-brand-primary/20 text-brand-primary">
                {stockDetail.sector}
              </Badge>
            )}
          </div>
          {stockDetail.name && (
            <p className="text-muted-foreground mt-1">{stockDetail.name}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={isFavorite ? "default" : "outline"}
            size="icon"
            onClick={toggleFavorite}
            className={isFavorite ? "bg-yellow-500 hover:bg-yellow-600 text-white" : "hover:border-yellow-500 hover:text-yellow-500"}
          >
            <Star className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
          </Button>
          <Button
            className="bg-brand-primary hover:bg-brand-primary/90"
            onClick={handleBuy}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Comprar
          </Button>
        </div>
      </div>

      {/* Price Overview */}
      <Card className="border-border">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1">
              <p className="text-sm text-muted-foreground mb-1">Precio Actual</p>
              <p className="text-4xl text-neutral-900">${stockDetail.price?.toFixed(2) || 'N/A'}</p>
              <div className="flex items-center gap-2 mt-2">
                {stockDetail.change >= 0 ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-success" />
                    <span className="text-success">
                      +${Math.abs(stockDetail.change).toFixed(2)} (+{stockDetail.changePercent.toFixed(2)}%)
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4 text-danger" />
                    <span className="text-danger">
                      -${Math.abs(stockDetail.change).toFixed(2)} ({stockDetail.changePercent.toFixed(2)}%)
                    </span>
                  </>
                )}
              </div>
            </div>
            
            <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
              {stockDetail.volume && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Volumen</p>
                  <p className="text-neutral-900">{(stockDetail.volume / 1000000).toFixed(1)}M</p>
                </div>
              )}
              {stockDetail.marketCap && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Cap. Mercado</p>
                  <p className="text-neutral-900">${(stockDetail.marketCap / 1000000000).toFixed(1)}B</p>
                </div>
              )}
              {stockDetail.pe && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">P/E Ratio</p>
                  <p className="text-neutral-900">{stockDetail.pe}</p>
                </div>
              )}
              {stockDetail.dividend && stockDetail.dividend > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Dividendo</p>
                  <p className="text-neutral-900">${stockDetail.dividend.toFixed(2)}</p>
                </div>
              )}
              {stockDetail.dividendYield && stockDetail.dividendYield > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Rendimiento Div.</p>
                  <p className="text-neutral-900">{stockDetail.dividendYield}%</p>
                </div>
              )}
              {stockDetail['52WeekHigh'] && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Máximo 52s</p>
                  <p className="text-neutral-900">${stockDetail['52WeekHigh']}</p>
                </div>
              )}
              {stockDetail['52WeekLow'] && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Mínimo 52s</p>
                  <p className="text-neutral-900">${stockDetail['52WeekLow']}</p>
                </div>
              )}
              {stockDetail.beta && stockDetail.beta > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Beta</p>
                  <p className="text-neutral-900">{stockDetail.beta}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      {stockDetail.description && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg">Descripción</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-600">{stockDetail.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Historical Chart */}
      {stockDetail.historicalData && stockDetail.historicalData.length > 0 && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg">Histórico (Últimos 12 meses)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full h-64 bg-neutral-50 rounded-lg p-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stockDetail.historicalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    interval={Math.floor(stockDetail.historicalData.length / 6)}
                  />
                  <YAxis tick={{ fontSize: 12 }} domain="dataMin - 10" />
                  <Tooltip 
                    formatter={(value: any) => `$${value.toFixed(2)}`}
                    labelFormatter={(label: any) => `Fecha: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="close" 
                    stroke="#4f46e5" 
                    dot={false}
                    strokeWidth={2}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}


      {/* Charts */}
      {/* Placeholder for additional charts - removed in favor of historical data above */}
    </div>
  );
}