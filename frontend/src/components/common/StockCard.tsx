import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '../ui/card';

interface StockCardProps {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  onClick?: () => void;
}

export function StockCard({ symbol, name, price, change, changePercent, onClick }: StockCardProps) {
  const isPositive = change >= 0;

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-lg border-border ${onClick ? 'hover:border-brand-secondary' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-neutral-900">{symbol}</h3>
            <p className="text-sm text-muted-foreground mt-1">{name}</p>
          </div>
          <div className="text-right">
            <p className="text-neutral-900">${price.toFixed(2)}</p>
            <div className={`flex items-center gap-1 mt-1 ${isPositive ? 'text-success' : 'text-danger'}`}>
              {isPositive ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span className="text-sm">
                {isPositive ? '+' : ''}{change.toFixed(2)} ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
