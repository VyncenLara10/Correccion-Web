'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card2';
import { Button } from '@/components/ui/button2';
import { formatCurrency, formatNumber, getChangeColor } from '@/lib/utils';
import { ArrowLeft, TrendingUp, TrendingDown, Star, ShoppingCart, DollarSign } from 'lucide-react';
import {getStocks, getStockHistory, toggleWatchlist as apiToggleWatchlist} from '@/lib/api';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function StockDetailPage({ params }: { params: { symbol: string } }) {
  const router = useRouter();
  const [stock, setStock] = useState<any>(null);
  const [priceHistory, setPriceHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inWatchlist, setInWatchlist] = useState(false);

  useEffect(() => {
    loadStockData();
  }, [params.symbol]);

  const loadStockData = async () => {
    setIsLoading(true);
    try {
      const stocks = await getStocks({ query: params.symbol });
      const stockData = stocks.results?.[0] || stocks[0];
      
      if (!stockData) {
        toast.error('Acción no encontrada');
        router.push('/dashboard/market');
        return;
      }

      setStock(stockData);
      setInWatchlist(stockData.is_in_watchlist);

      const history = await getStockHistory(stockData.id, '1d');
      setPriceHistory(history.map((h: any) => ({
        date: new Date(h.timestamp).toLocaleDateString(),
        price: parseFloat(h.close_price),
      })));
    } catch (error) {
      toast.error('Error al cargar la acción');
      router.push('/dashboard/market');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleWatchlist = async () => {
    if (!stock) return;
    try {
      await apiToggleWatchlist(stock.id);
      setInWatchlist(!inWatchlist);
      toast.success(inWatchlist ? 'Removido de favoritos' : 'Agregado a favoritos');
    } catch (error) {
      toast.error('Error al actualizar favoritos');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!stock) return null;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center text-gray-400 hover:text-white transition"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Volver al mercado
      </button>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
            <span className="text-2xl font-bold text-white">
              {stock.symbol.substring(0, 2)}
            </span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">{stock.symbol}</h1>
            <p className="text-gray-400">{stock.name}</p>
            <p className="text-sm text-gray-500">{stock.market}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleToggleWatchlist}
            className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition"
          >
            <Star className={`w-6 h-6 ${inWatchlist ? 'fill-primary-500 text-primary-500' : 'text-gray-400'}`} />
          </button>
          <Link href={`/dashboard/trade?stock=${stock.id}&type=buy`}>
            <Button size="lg">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Comprar
            </Button>
          </Link>
        </div>
      </div>

      {/* Price Info */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="md:col-span-2">
          <CardContent className="pt-6">
            <div className="flex items-baseline space-x-3 mb-2">
              <div className="text-4xl font-bold text-white">
                {formatCurrency(stock.current_price)}
              </div>
              <div className={`flex items-center text-lg font-semibold ${getChangeColor(stock.change_percent)}`}>
                {stock.change_percent >= 0 ? (
                  <TrendingUp className="w-5 h-5 mr-1" />
                ) : (
                  <TrendingDown className="w-5 h-5 mr-1" />
                )}
                {stock.change_percent >= 0 ? '+' : ''}
                {formatCurrency(stock.change_amount)} ({stock.change_percent.toFixed(2)}%)
              </div>
            </div>
            {!stock.is_market_open && (
              <p className="text-sm text-yellow-500">
                Mercado cerrado - Precio al cierre
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Apertura</span>
                <span className="text-white font-semibold">{formatCurrency(stock.opening_price || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Cierre Anterior</span>
                <span className="text-white font-semibold">{formatCurrency(stock.previous_close || 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Máximo</span>
                <span className="text-white font-semibold">{formatCurrency(stock.day_high || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Mínimo</span>
                <span className="text-white font-semibold">{formatCurrency(stock.day_low || 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Precios (30 días)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={priceHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  stroke="#9CA3AF"
                  tick={{ fill: '#9CA3AF' }}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  tick={{ fill: '#9CA3AF' }}
                  domain={['auto', 'auto']}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '0.5rem',
                    color: '#fff'
                  }}
                  formatter={(value: any) => formatCurrency(value)}
                />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#0066FF" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Volumen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {formatNumber(stock.volume)}
            </div>
            <p className="text-sm text-gray-400 mt-1">
              Promedio: {formatNumber(stock.average_volume || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Capitalización</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              ${(stock.market_cap / 1000000000).toFixed(2)}B
            </div>
            <p className="text-sm text-gray-400 mt-1">Miles de millones USD</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              stock.is_market_open ? 'bg-success-DEFAULT/10 text-success-DEFAULT' : 'bg-gray-700 text-gray-400'
            }`}>
              {stock.is_market_open ? '● Mercado Abierto' : '● Mercado Cerrado'}
            </div>
            <p className="text-sm text-gray-400 mt-2">
              {stock.is_tradable ? 'Disponible para trading' : 'No disponible'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* About */}
      {stock.description && (
        <Card>
          <CardHeader>
            <CardTitle>Acerca de {stock.company_name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 leading-relaxed">{stock.description}</p>
            {stock.website && (
              <a
                href={stock.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center mt-4 text-primary-500 hover:text-primary-400 transition"
              >
                Visitar sitio web →
              </a>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href={`/dashboard/trade?stock=${stock.id}&type=buy`}>
          <div className="p-6 bg-gradient-to-br from-success-DEFAULT to-success-dark rounded-xl hover:scale-105 transition cursor-pointer">
            <ShoppingCart className="w-8 h-8 text-white mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">Comprar {stock.symbol}</h3>
            <p className="text-sm text-success-light">Invierte en esta acción ahora</p>
          </div>
        </Link>

        <Link href="/dashboard/portfolio">
          <div className="p-6 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl hover:scale-105 transition cursor-pointer">
            <DollarSign className="w-8 h-8 text-white mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">Ver mi Portafolio</h3>
            <p className="text-sm text-primary-100">Revisa tus inversiones</p>
          </div>
        </Link>
      </div>
    </div>
  );
}