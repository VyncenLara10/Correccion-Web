'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button2';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card2';
import type { Stock } from '@/types';

interface TradeFormProps {
  stock: Stock;
  onBuy: (quantity: number) => Promise<void>;
  onSell: (quantity: number) => Promise<void>;
  userBalance: number;
  userQuantity?: number;
}

export function TradeForm({ stock, onBuy, onSell, userBalance, userQuantity = 0 }: TradeFormProps) {
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const total = stock.price * quantity;
  const canBuy = total <= userBalance && quantity <= stock.available_quantity;
  const canSell = quantity <= userQuantity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (quantity < 1) {
      alert('La cantidad debe ser al menos 1');
      return;
    }

    setIsLoading(true);
    try {
      if (tradeType === 'buy') {
        if (!canBuy) {
          alert('Saldo insuficiente o cantidad no disponible');
          return;
        }
        await onBuy(quantity);
      } else {
        if (!canSell) {
          alert('No tienes suficientes acciones para vender');
          return;
        }
        await onSell(quantity);
      }
      setQuantity(1);
    } catch (error) {
      console.error('Error en operación:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <h2 className="text-2xl font-bold text-white">Operar {stock.symbol}</h2>
      </CardHeader>
      <CardContent>
        {/* Trade Type Selector */}
        <div className="flex gap-2 mb-6">
          <Button
            type="button"
            onClick={() => setTradeType('buy')}
            className={`flex-1 ${
              tradeType === 'buy'
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            Comprar
          </Button>
          <Button
            type="button"
            onClick={() => setTradeType('sell')}
            className={`flex-1 ${
              tradeType === 'sell'
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-white/10 hover:bg-white/20'
            }`}
            disabled={userQuantity === 0}
          >
            Vender
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Stock Info */}
          <div className="p-4 bg-white/5 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Precio por acción:</span>
              <span className="text-white font-semibold">${stock.price.toFixed(2)}</span>
            </div>
            {tradeType === 'buy' && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-400">Disponibles:</span>
                  <span className="text-white">{stock.available_quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tu saldo:</span>
                  <span className="text-cyan-400 font-semibold">${userBalance.toFixed(2)}</span>
                </div>
              </>
            )}
            {tradeType === 'sell' && (
              <div className="flex justify-between">
                <span className="text-gray-400">Tus acciones:</span>
                <span className="text-white">{userQuantity}</span>
              </div>
            )}
          </div>

          {/* Quantity Input */}
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-300 mb-2">
              Cantidad de acciones
            </label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max={tradeType === 'buy' ? stock.available_quantity : userQuantity}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="bg-white/5 border-white/10 text-white text-lg"
            />
            <p className="text-gray-400 text-sm mt-1">
              Máximo: {tradeType === 'buy' ? stock.available_quantity : userQuantity}
            </p>
          </div>

          {/* Quick Select */}
          <div className="flex gap-2">
            {[10, 25, 50, 100].map((value) => (
              <Button
                key={value}
                type="button"
                onClick={() => setQuantity(Math.min(value, tradeType === 'buy' ? stock.available_quantity : userQuantity))}
                className="flex-1 bg-white/5 hover:bg-white/10 text-sm"
                size="sm"
              >
                {value}
              </Button>
            ))}
          </div>

          {/* Total */}
          <div className="p-4 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-white font-semibold text-lg">Total:</span>
              <span className="text-cyan-400 font-bold text-2xl">
                ${total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading || (tradeType === 'buy' ? !canBuy : !canSell)}
            className={`w-full text-lg py-6 ${
              tradeType === 'buy'
                ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
            }`}
          >
            {isLoading ? (
              'Procesando...'
            ) : (
              <>
                {tradeType === 'buy' ? 'Comprar' : 'Vender'} {quantity} {quantity === 1 ? 'acción' : 'acciones'}
              </>
            )}
          </Button>

          {/* Warnings */}
          {tradeType === 'buy' && !canBuy && (
            <p className="text-red-400 text-sm text-center">
              {total > userBalance ? 'Saldo insuficiente' : 'Cantidad no disponible'}
            </p>
          )}
          {tradeType === 'sell' && !canSell && (
            <p className="text-red-400 text-sm text-center">
              No tienes suficientes acciones
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}