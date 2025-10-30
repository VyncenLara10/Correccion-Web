'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card2';
import { Button } from '@/components/ui/button2';
import { formatCurrency, getChangeColor } from '@/lib/utils';
import { Star, TrendingUp, TrendingDown, Eye, ShoppingCart, Trash2 } from 'lucide-react';
import {getWatchlist, toggleWatchlist } from '@/lib/api';
import { toast } from 'sonner';

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWatchlist();
  }, []);

  const loadWatchlist = async () => {
    setIsLoading(true);
    try {
      const data = await getWatchlist();
      setWatchlist(data.results || data);
    } catch (error) {
      toast.error('Error al cargar favoritos');
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWatchlist = async (stockId: string) => {
    try {
      await toggleWatchlist(stockId);
      toast.success('Removido de favoritos');
      loadWatchlist();
    } catch (error) {
      toast.error('Error al remover de favoritos');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Mis Favoritos</h1>
        <p className="text-gray-400">Acciones que estás siguiendo</p>
      </div>

      {watchlist.length === 0 ? (
        <Card>
          <CardContent className="py-20 text-center">
            <Star className="w-20 h-20 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No tienes favoritos aún</h3>
            <p className="text-gray-400 mb-6">Agrega acciones a tu lista de seguimiento</p>
            <Link href="/dashboard/market">
              <Button>Explorar Mercado</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {watchlist.map((item) => (
            <Card key={item.id} className="hover:border-primary-500 transition group">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-lg font-bold text-white">{item.stock.symbol}</h3>
                      <Star className="w-4 h-4 fill-primary-500 text-primary-500" />
                    </div>
                    <p className="text-sm text-gray-400 line-clamp-1">{item.stock.name}</p>
                  </div>
                  <button
                    onClick={() => removeFromWatchlist(item.stock.id)}
                    className="text-gray-400 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="mb-4">
                  <div className="text-2xl font-bold text-white mb-1">
                    {formatCurrency(item.stock.current_price)}
                  </div>
                  <div className={`flex items-center text-sm ${getChangeColor(item.stock.change_percent)}`}>
                    {item.stock.change_percent >= 0 ? (
                      <TrendingUp className="w-4 h-4 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 mr-1" />
                    )}
                    {item.stock.change_percent >= 0 ? '+' : ''}
                    {formatCurrency(item.stock.change_amount)} ({item.stock.change_percent.toFixed(2)}%)
                  </div>
                </div>

                {item.notes && (
                  <p className="text-sm text-gray-400 mb-4 line-clamp-2">{item.notes}</p>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                  <Link href={`/dashboard/market/${item.stock.symbol}`}>
                    <Button size="sm" variant="outline" className="text-xs">
                      <Eye className="w-3 h-3 mr-1" />
                      Ver
                    </Button>
                  </Link>
                  <Link href={`/dashboard/trade?stock=${item.stock.id}&type=buy`}>
                    <Button size="sm" className="text-xs">
                      <ShoppingCart className="w-3 h-3 mr-1" />
                      Comprar
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}