'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Card, CardContent, CardHeader } from '@/components/ui/card2';
import { Button } from '@/components/ui/button2';
import { getStockHistory } from '@/lib/api';
import type { TimePeriod } from '@/lib/constants';

interface StockChartProps {
  symbol: string;
  currentPrice: number;
}

export function StockChart({ symbol, currentPrice }: StockChartProps) {
  const [period, setPeriod] = useState<TimePeriod>('1M');
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const periods: { label: string; value: TimePeriod }[] = [
    { label: '1D', value: '1D' },
    { label: '1S', value: '1W' },
    { label: '1M', value: '1M' },
    { label: '3M', value: '3M' },
    { label: '1A', value: '1Y' },
    { label: 'Todo', value: 'ALL' }
  ];

  useEffect(() => {
    loadChartData();
  }, [symbol, period]);

  const loadChartData = async () => {
    setIsLoading(true);
    try {
      // CONECTA CON: GET /api/stocks/:symbol/history?period=1M
      const response = await getStockHistory(symbol, period);
      
      // Formatear datos para el gráfico
      const formattedData = response.history.map((item: any) => ({
        date: formatDate(item.date),
        price: item.price,
        volume: item.volume
      }));
      
      setData(formattedData);
    } catch (error) {
      console.error('Error al cargar historial:', error);
      // Si falla, usar datos mock
      setData(generateMockData(period));
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    
    if (period === '1D') {
      return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } else if (period === '1W' || period === '1M') {
      return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
    } else {
      return date.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
    }
  };

  const generateMockData = (selectedPeriod: TimePeriod) => {
    const points = selectedPeriod === '1D' ? 24 : selectedPeriod === '1W' ? 7 : selectedPeriod === '1M' ? 30 : 90;
    const mockData = [];
    let price = currentPrice;

    for (let i = points; i >= 0; i--) {
      const date = new Date();
      if (selectedPeriod === '1D') {
        date.setHours(date.getHours() - i);
      } else {
        date.setDate(date.getDate() - i);
      }

      // Simular variación de precio
      price = price * (1 + (Math.random() - 0.5) * 0.02);
      
      mockData.push({
        date: formatDate(date.toISOString()),
        price: parseFloat(price.toFixed(2)),
        volume: Math.floor(Math.random() * 1000000)
      });
    }

    return mockData;
  };

  const firstPrice = data[0]?.price || currentPrice;
  const lastPrice = data[data.length - 1]?.price || currentPrice;
  const priceChange = lastPrice - firstPrice;
  const priceChangePercent = (priceChange / firstPrice) * 100;
  const isPositive = priceChange >= 0;

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-white mb-1">
              ${lastPrice.toFixed(2)}
            </h3>
            <div className="flex items-center gap-2">
              <span className={`text-lg font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {isPositive ? '+' : ''}{priceChange.toFixed(2)} ({isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}%)
              </span>
              <span className="text-gray-400 text-sm">
                en {periods.find(p => p.value === period)?.label}
              </span>
            </div>
          </div>

          {/* Period Selector */}
          <div className="flex gap-1 bg-white/5 rounded-lg p-1">
            {periods.map((p) => (
              <Button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`px-3 py-1 text-sm ${
                  period === p.value
                    ? 'bg-cyan-500 hover:bg-cyan-600 text-white'
                    : 'bg-transparent hover:bg-white/10 text-gray-400'
                }`}
                size="sm"
              >
                {p.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="h-[400px] flex items-center justify-center">
            <p className="text-gray-400">Cargando datos...</p>
          </div>
        ) : (
          <>
            {/* Price Chart */}
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop 
                      offset="5%" 
                      stopColor={isPositive ? '#10b981' : '#ef4444'} 
                      stopOpacity={0.3}
                    />
                    <stop 
                      offset="95%" 
                      stopColor={isPositive ? '#10b981' : '#ef4444'} 
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="date" 
                  stroke="rgba(255,255,255,0.5)"
                  style={{ fontSize: '12px' }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.5)"
                  style={{ fontSize: '12px' }}
                  domain={['auto', 'auto']}
                  tickFormatter={(value) => `$${value.toFixed(0)}`}
                />
                <Tooltip
                  contentStyle={{
                    background: '#1e293b',
                    border: '1px solid rgba(0, 212, 255, 0.3)',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  labelStyle={{ color: '#00d4ff' }}
                  formatter={(value: any) => [`$${value.toFixed(2)}`, 'Precio']}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={isPositive ? '#10b981' : '#ef4444'}
                  strokeWidth={2}
                  fill="url(#colorPrice)"
                  fillOpacity={1}
                />
              </AreaChart>
            </ResponsiveContainer>

            {/* Volume Chart */}
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-gray-400 mb-2">Volumen</h4>
              <ResponsiveContainer width="100%" height={100}>
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00d4ff" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    hide
                  />
                  <YAxis 
                    hide
                    domain={['auto', 'auto']}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#1e293b',
                      border: '1px solid rgba(0, 212, 255, 0.3)',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                    formatter={(value: any) => [value.toLocaleString(), 'Volumen']}
                  />
                  <Area
                    type="monotone"
                    dataKey="volume"
                    stroke="#00d4ff"
                    strokeWidth={1}
                    fill="url(#colorVolume)"
                    fillOpacity={1}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}