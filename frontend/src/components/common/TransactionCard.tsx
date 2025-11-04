import { ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';

interface TransactionCardProps {
  id: string;
  type: 'buy' | 'sell';
  symbol: string;
  shares: number;
  price: number;
  total: number;
  date: string;
  status: 'completed' | 'pending' | 'cancelled';
}

export function TransactionCard({ type, symbol, shares, price, total, date, status }: TransactionCardProps) {
  const isBuy = type === 'buy';

  const statusColors = {
    completed: 'bg-success-light text-success border-success',
    pending: 'bg-warning-light text-warning border-warning',
    cancelled: 'bg-danger-light text-danger border-danger',
  };

  const statusLabels = {
    completed: 'Completada',
    pending: 'Pendiente',
    cancelled: 'Cancelada',
  };

  return (
    <Card className="border-border">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${isBuy ? 'bg-success-light' : 'bg-danger-light'}`}>
              {isBuy ? (
                <ArrowDownLeft className="h-5 w-5 text-success" />
              ) : (
                <ArrowUpRight className="h-5 w-5 text-danger" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-neutral-900">{isBuy ? 'Compra' : 'Venta'} - {symbol}</h4>
                <Badge variant="outline" className={statusColors[status]}>
                  {statusLabels[status]}
                </Badge>
              </div>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-muted-foreground">
                  {shares} acciones @ ${price.toFixed(2)}
                </p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{date}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className={`${isBuy ? 'text-danger' : 'text-success'}`}>
              {isBuy ? '-' : '+'}${total.toFixed(2)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
