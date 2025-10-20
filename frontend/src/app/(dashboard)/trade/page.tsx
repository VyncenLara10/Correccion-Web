'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader } from '@/components/ui/card2';
import { Button } from '@/components/ui/button2';
import { Input } from '@/components/ui/input';
import { TrendingUp, TrendingDown, DollarSign, Calculator } from 'lucide-react';

function TradeForm() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  const stockSymbol = searchParams?.get('stock') || '';
  const tradeType = searchParams?.get('type') as 'buy' | 'sell' || 'buy';

  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [shares, setShares] = useState('');
  const [limitPrice, setLimitPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock stock data
  const stockPrice = 150.25;
  const totalCost = parseFloat(shares) * stockPrice;
  const commission = totalCost * 0.01; // 1% commission
  const finalAmount = totalCost + commission;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // CONECTA CON: POST /api/trades
      // await api.post('/trades', {
      //   stock_symbol: stockSymbol,
      //   type: tradeType,
      //   order_type: orderType,
      //   shares: parseFloat(shares),
      //   limit_price: orderType === 'limit' ? parseFloat(limitPrice) : null
      // });

      console.log('Trade submitted:', { stockSymbol, tradeType, orderType, shares, limitPrice });
      
      // Reset form
      setShares('');
      setLimitPrice('');
    } catch (error) {
      console.error('Error submitting trade:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  const userBalance = user.balance || 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          {tradeType === 'buy' ? 'Comprar' : 'Vender'} Acciones
        </h1>
        <p className="text-gray-400">
          {stockSymbol ? `${stockSymbol} - $${stockPrice.toFixed(2)}` : 'Selecciona una acción'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trade Form */}
        <div className="lg:col-span-2">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Orden de {tradeType === 'buy' ? 'Compra' : 'Venta'}</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setOrderType('market')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      orderType === 'market'
                        ? 'bg-cyan-500 text-white'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    Mercado
                  </button>
                  <button
                    onClick={() => setOrderType('limit')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      orderType === 'limit'
                        ? 'bg-cyan-500 text-white'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    Límite
                  </button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Stock Symbol */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Símbolo
                  </label>
                  <Input
                    type="text"
                    value={stockSymbol}
                    disabled
                    className="bg-white/5 border-white/10 text-white disabled:opacity-50"
                  />
                </div>

                {/* Number of Shares */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Cantidad de Acciones
                  </label>
                  <Input
                    type="number"
                    value={shares}
                    onChange={(e) => setShares(e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="0"
                    min="1"
                    step="1"
                    required
                  />
                </div>

                {/* Limit Price (if limit order) */}
                {orderType === 'limit' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Precio Límite
                    </label>
                    <Input
                      type="number"
                      value={limitPrice}
                      onChange={(e) => setLimitPrice(e.target.value)}
                      className="bg-white/5 border-white/10 text-white"
                      placeholder="0.00"
                      min="0.01"
                      step="0.01"
                      required
                    />
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={!shares || isSubmitting || !stockSymbol}
                  className={`w-full ${
                    tradeType === 'buy'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                      : 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      {tradeType === 'buy' ? (
                        <TrendingUp className="w-4 h-4 mr-2" />
                      ) : (
                        <TrendingDown className="w-4 h-4 mr-2" />
                      )}
                      {tradeType === 'buy' ? 'Comprar' : 'Vender'} Acciones
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="bg-white/5 border-white/10 sticky top-6">
            <CardHeader>
              <h3 className="text-lg font-semibold text-white">Resumen de Orden</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-white/10">
                <span className="text-gray-400">Precio por acción</span>
                <span className="font-semibold text-white">${stockPrice.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-white/10">
                <span className="text-gray-400">Acciones</span>
                <span className="font-semibold text-white">{shares || 0}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-white/10">
                <span className="text-gray-400">Subtotal</span>
                <span className="font-semibold text-white">
                  ${isNaN(totalCost) ? '0.00' : totalCost.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-white/10">
                <span className="text-gray-400">Comisión (1%)</span>
                <span className="font-semibold text-white">
                  ${isNaN(commission) ? '0.00' : commission.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between py-3 bg-cyan-500/10 rounded-lg px-3">
                <span className="text-cyan-400 font-semibold">Total</span>
                <span className="font-bold text-cyan-400 text-xl">
                  ${isNaN(finalAmount) ? '0.00' : finalAmount.toFixed(2)}
                </span>
              </div>

              {/* Balance */}
              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Saldo disponible</span>
                  <span className="font-semibold text-white">
                    ${userBalance.toFixed(2)}
                  </span>
                </div>
                
                {shares && finalAmount > userBalance && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                    <p className="text-red-400 text-sm">
                      Saldo insuficiente para completar esta orden
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function TradePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-white">Cargando...</div>
      </div>
    }>
      <TradeForm />
    </Suspense>
  );
}