'use client';

import { TrendingUp, TrendingDown, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button2';
import { Badge } from '@/components/ui/bagde';
import { Card, CardContent } from '@/components/ui/card2';
import type { Stock } from '@/types';
import { MiniChart } from '@/components/chart/mini-chart';
import Link from 'next/link';

interface StockCardProps {
  stock: Stock;
  onBuy?: (stockId: string) => void;
}

export function StockCard({ stock, onBuy }: StockCardProps) {
  const isPositive = stock.change_24h >= 0;
  
  // Mock data para el mini gráfico - en producción vendría del backend
  const mockChartData = [
    stock.price * 0.98,
    stock.price * 0.97,
    stock.price * 1.01,
    stock.price * 0.99,
    stock.price
  ];

  return (
    <Card className="bg-white/5 border-white/10 hover:border-cyan-500/50 transition-all hover:shadow-lg hover:shadow-cyan-500/20">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <Link href={`/market/${stock.symbol}`}>
              <h3 className="text-xl font-bold text-cyan-400 hover:text-cyan-300 cursor-pointer">
                {stock.symbol}
              </h3>
            </Link>
            <p className="text-gray-400 text-sm">{stock.name}</p>
          </div>
          <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
            {stock.sector}
          </Badge>
        </div>

        {/* Price Section */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-bold text-white">
              ${stock.price.toFixed(2)}
            </span>
            <div className={`flex items-center gap-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {isPositive ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span className="font-semibold">
                {isPositive ? '+' : ''}{stock.change_24h.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        {/* Mini Chart */}
        <div className="mb-4 h-12">
          <MiniChart 
            data={mockChartData} 
            color={isPositive ? '#10b981' : '#ef4444'}
            height={48}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-gray-400 text-xs mb-1">Volumen</p>
            <p className="text-white font-semibold text-sm">
              {(stock.volume / 1000000).toFixed(1)}M
            </p>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-gray-400 text-xs mb-1">Cap. Mercado</p>
            <p className="text-white font-semibold text-sm">
              ${(stock.market_cap / 1000000000).toFixed(1)}B
            </p>
          </div>
        </div>

        {/* Availability */}
        <div className="mb-4 p-3 bg-white/5 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Disponibles:</span>
            <span className={`font-semibold ${stock.available_quantity > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {stock.available_quantity} acciones
            </span>
          </div>
        </div>

        {/* Action Button */}
        {onBuy && (
          <Button
            onClick={() => onBuy(stock.id)}
            disabled={!stock.is_active || stock.available_quantity === 0}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {!stock.is_active ? (
              'No Disponible'
            ) : stock.available_quantity === 0 ? (
              'Agotado'
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Comprar
              </>
            )}
          </Button>
        )}

        {!onBuy && (
          <Link href={`/market/${stock.symbol}`}>
            <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600">
              Ver Detalles
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}