'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button2';
import { Badge } from '@/components/ui/bagde';
import type { PortfolioItem } from '@/types';
import { MiniChart } from '@/components/chart/mini-chart';

interface PortfolioItemProps {
  item: PortfolioItem;
  onSell?: (stockId: string) => void;
}

export function PortfolioItemCard({ item, onSell }: PortfolioItemProps) {
  const isProfit = item.profit_loss >= 0;
  
  // Mock data para el mini gráfico - en producción vendría del backend
  const mockChartData = [
    item.avg_price * 0.95,
    item.avg_price * 0.97,
    item.avg_price * 1.02,
    item.current_price
  ];

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-cyan-400">{item.symbol}</h3>
          <p className="text-gray-400 text-sm">{item.name}</p>
        </div>
        <Badge className={`${isProfit ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'} border-0`}>
          {isProfit ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
          {isProfit ? '+' : ''}{item.profit_loss_percent.toFixed(2)}%
        </Badge>
      </div>

      {/* Mini Chart */}
      <div className="mb-4">
        <MiniChart 
          data={mockChartData} 
          color={isProfit ? '#10b981' : '#ef4444'}
          height={50}
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-gray-400 text-xs mb-1">Cantidad</p>
          <p className="text-white font-semibold">{item.quantity}</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs mb-1">Precio Actual</p>
          <p className="text-white font-semibold">${item.current_price.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs mb-1">Precio Promedio</p>
          <p className="text-white font-semibold">${item.avg_price.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs mb-1">Valor Total</p>
          <p className="text-white font-semibold">${item.total_value.toFixed(2)}</p>
        </div>
      </div>

      {/* Profit/Loss */}
      <div className="p-3 bg-white/5 rounded-lg mb-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">Ganancia/Pérdida</span>
          <span className={`font-bold text-lg ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
            {isProfit ? '+' : ''}${item.profit_loss.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Actions */}
      {onSell && (
        <Button
          onClick={() => onSell(item.stock_id)}
          className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50"
        >
          Vender
        </Button>
      )}
    </div>
  );
}