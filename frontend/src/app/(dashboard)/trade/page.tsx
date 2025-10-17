'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card2';
import { Button } from '@/components/ui/button2';
import { formatCurrency, getChangeColor } from '@/lib/utils';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

export default function TradePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [stock, setStock] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [type, setType] = useState<'buy' | 'sell'>('buy');
  const [isLoading, setIsLoading] = useState(false);
  const [portfolio, setPortfolio] = useState<any>(null);

  useEffect(() => {
    const stockId = searchParams.get('stock');
    const tradeType = searchParams.get('type') as 'buy' | 'sell';
    
    if (stockId) {
      loadStock(stockId);
    }
    if (tradeType) {
      setType(tradeType);
    }
  }, [searchParams]);

  const loadStock = async (stockId: string) => {
    try {
      const stockData = await api.getStock(stockId);
      setStock(stockData);
      
      // Cargar posición en portafolio si existe
      const portfolioData = await api.getPortfolio();
      const position = portfolioData.results?.find((p: any) => p.stock.id === stockId) || 
                      portfolioData.find((p: any) => p.stock.id === stockId);
      setPortfolio(position);
    } catch (error) {
      toast.error('Error al cargar la acción');
    }
  };

  const handleTrade = async () => {
    if (!stock) return;

    if (quantity <= 0) {
      toast.error('La cantidad debe ser mayor a 0');
      return;
    }

    if (type === 'sell' && (!portfolio || quantity > portfolio.quantity)) {
      toast.error('No tienes suficientes acciones para vender');
      return;
    }

    const total = quantity * stock.current_price;
    const commission = total * 0.005;
    const finalAmount = type === 'buy' ? total + commission : total - commission;

    if (type === 'buy' && user && finalAmount > user.balance) {
      toast.error('Saldo insuficiente');
      return;
    }

    setIsLoading(true);
    try {
      await api.createTransaction({
        stock_id: stock.id,
        transaction_type: type,
        quantity,
      });

      toast.success(
        `${type === 'buy' ? 'Compra' : 'Venta'} realizada exitosamente`,
        {
          description: `${quantity} acciones de ${stock.symbol} por ${formatCurrency(finalAmount)}`,
        }
      );

      await refreshUser();
      router.push('/dashboard/portfolio');
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || error.response?.data?.non_field_errors?.[0] || 'Error al realizar la transacción';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (!stock) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const total = quantity * stock.current_price;
  const commission = total * 0.005;
  const finalAmount = type === 'buy' ? total + commission : total - commission;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          {type === 'buy' ? 'Comprar' : 'Vender'} Acciones
        </h1>
        <p className="text-gray-400">Complete los detalles de su transacción</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary-500/10 rounded-lg flex items-center justify-center">
                  <span className="text-lg font-bold text-primary-500">{stock.symbol.substring(0, 2)}</span>
                </div>
                <div>
                  <CardTitle>{stock.symbol}</CardTitle>
                  <p className="text-sm text-gray-400">{stock.name}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{formatCurrency(stock.current_price)}</div>
                <div className={`text-sm flex items-center justify-end ${getChangeColor(stock.change_percent)}`}>
                  {stock.change_percent >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                  {stock.change_percent >= 0 ? '+' : ''}{stock.change_percent.toFixed(2)}%
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Market Status */}
            {!stock.is_market_open && (
              <div className="flex items-center p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-500 mr-3" />
                <div className="text-sm text-yellow-500">
                  El mercado está cerrado. Su orden se ejecutará cuando el mercado abra.
                </div>
              </div>
            )}

            {/* Trade Type Toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Tipo de Operación</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setType('buy')}
                  className={`p-4 rounded-lg border-2 transition ${
                    type === 'buy'
                      ? 'border-success-DEFAULT bg-success-DEFAULT/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <TrendingUp className={`w-6 h-6 mx-auto mb-2 ${type === 'buy' ? 'text-success-DEFAULT' : 'text-gray-400'}`} />
                  <div className={`font-semibold ${type === 'buy' ? 'text-success-DEFAULT' : 'text-gray-400'}`}>
                    Comprar
                  </div>
                </button>
                <button
                  onClick={() => setType('sell')}
                  disabled={!portfolio || portfolio.quantity === 0}
                  className={`p-4 rounded-lg border-2 transition disabled:opacity-50 disabled:cursor-not-allowed ${
                    type === 'sell'
                      ? 'border-danger-DEFAULT bg-danger-DEFAULT/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <TrendingDown className={`w-6 h-6 mx-auto mb-2 ${type === 'sell' ? 'text-danger-DEFAULT' : 'text-gray-400'}`} />
                  <div className={`font-semibold ${type === 'sell' ? 'text-danger-DEFAULT' : 'text-gray-400'}`}>
                    Vender
                  </div>
                </button>
              </div>
            </div>

            {/* Quantity Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Cantidad de Acciones
              </label>
              <input
                type="number"
                min="1"
                max={type === 'sell' && portfolio ? portfolio.quantity : undefined}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {type === 'sell' && portfolio && (
                <p className="mt-2 text-sm text-gray-400">
                  Tienes {portfolio.quantity} acciones disponibles
                </p>
              )}
            </div>

            {/* Quick Amounts */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Cantidades Rápidas</label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 5, 10, 25].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setQuantity(amount)}
                    disabled={type === 'sell' && portfolio && amount > portfolio.quantity}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition"
                  >
                    {amount}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleTrade}
              isLoading={isLoading}
              disabled={quantity <= 0 || !stock.is_market_open && type === 'buy'}
              className="w-full py-4 text-lg"
              variant={type === 'buy' ? 'primary' : 'danger'}
            >
              {type === 'buy' ? 'Comprar' : 'Vender'} {quantity} {quantity === 1 ? 'Acción' : 'Acciones'}
            </Button>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumen de Orden</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Precio por Acción</span>
                <span className="text-white font-semibold">{formatCurrency(stock.current_price)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Cantidad</span>
                <span className="text-white font-semibold">{quantity}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Subtotal</span>
                <span className="text-white font-semibold">{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Comisión (0.5%)</span>
                <span className="text-white font-semibold">{formatCurrency(commission)}</span>
              </div>
              <div className="pt-4 border-t border-gray-700">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-white">Total</span>
                  <span className={`text-xl font-bold ${type === 'buy' ? 'text-danger-DEFAULT' : 'text-success-DEFAULT'}`}>
                    {type === 'buy' ? '-' : '+'}{formatCurrency(finalAmount)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card>
            <CardHeader>
              <CardTitle>Tu Cuenta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Balance Actual</span>
                <span className="text-white font-semibold">{formatCurrency(user?.balance || 0)}</span>
              </div>
              {type === 'buy' && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Balance Después</span>
                  <span className={`font-semibold ${
                    (user?.balance || 0) - finalAmount >= 0 ? 'text-success-DEFAULT' : 'text-danger-DEFAULT'
                  }`}>
                    {formatCurrency((user?.balance || 0) - finalAmount)}
                  </span>
                </div>
              )}
              {type === 'sell' && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Balance Después</span>
                  <span className="text-success-DEFAULT font-semibold">
                    {formatCurrency((user?.balance || 0) + finalAmount)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="bg-primary-500/10 border-primary-500/20">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-primary-100">
                  <p className="font-semibold mb-1">Información Importante</p>
                  <ul className="space-y-1 text-primary-200">
                    <li>• Las órdenes se ejecutan al precio actual del mercado</li>
                    <li>• La comisión es del 0.5% por transacción</li>
                    <li>• Las transacciones son irreversibles</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}