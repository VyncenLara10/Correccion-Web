import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Progress } from '../ui/progress';

interface PortfolioCardProps {
  symbol: string;
  name: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  totalValue: number;
  gainLoss: number;
  gainLossPercent: number;
  allocation: number;
}

export function PortfolioCard({
  symbol,
  name,
  shares,
  avgPrice,
  currentPrice,
  totalValue,
  gainLoss,
  gainLossPercent,
  allocation,
}: PortfolioCardProps) {
  const isProfit = gainLoss >= 0;

  return (
    <Card className="border-border">
      <CardContent className="p-5">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-neutral-900">{symbol}</h3>
              <p className="text-sm text-muted-foreground mt-1">{name}</p>
            </div>
            <div className="text-right">
              <p className="text-neutral-900">${totalValue.toFixed(2)}</p>
              <div className={`flex items-center justify-end gap-1 mt-1 ${isProfit ? 'text-success' : 'text-danger'}`}>
                {isProfit ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span className="text-sm">
                  {isProfit ? '+' : ''}{gainLoss.toFixed(2)} ({isProfit ? '+' : ''}{gainLossPercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Acciones</p>
              <p className="text-neutral-900 mt-1">{shares}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Precio Actual</p>
              <p className="text-neutral-900 mt-1">${currentPrice.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Precio Promedio</p>
              <p className="text-neutral-900 mt-1">${avgPrice.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Asignación</p>
              <p className="text-neutral-900 mt-1">{allocation.toFixed(1)}%</p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Distribución</span>
              <span className="text-neutral-900">{allocation.toFixed(1)}%</span>
            </div>
            <Progress value={allocation} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
