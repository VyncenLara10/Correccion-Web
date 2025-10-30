'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card2';
import { Button } from '@/components/ui/button2';
import { Search, Filter, TrendingUp, TrendingDown, Star, Eye } from 'lucide-react';
import { 
  getStocks, 
  getStockCategories, 
  getGainers, 
  getLosers,
  getTrendingStocks, 
  toggleWatchlist as apiToggleWatchlist
} from '@/lib/api';

export default function MarketPage() {
  const [stocks, setStocks] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('symbol');
  const [sortOrder, setSortOrder] = useState('asc');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterStocks();
  }, [searchQuery, selectedCategory, sortBy, sortOrder, activeTab]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [stocksData, categoriesData] = await Promise.all([
        getStocks(),
        getStockCategories(),
      ]);
      setStocks(stocksData.results || stocksData.stocks || stocksData);
      setCategories(categoriesData.results || categoriesData.categories || categoriesData);
    } catch (error) {
      console.error('Error al cargar el mercado:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterStocks = async () => {
    try {
      let data;
      if (activeTab === 'gainers') {
        data = await getGainers();
      } else if (activeTab === 'losers') {
        data = await getLosers();
      } else if (activeTab === 'trending') {
        data = await getTrendingStocks();
      } else {
        data = await getStocks({
          query: searchQuery,
          category: selectedCategory,
          sort_by: sortBy,
          sort_order: sortOrder,
        });
      }
      setStocks(data.results || data.stocks || data);
    } catch (error) {
      console.error('Error filtering stocks:', error);
    }
  };

  const handleToggleWatchlist = async (stockId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    try {
      await apiToggleWatchlist(stockId);
      await filterStocks(); 
    } catch (error) {
      console.error('Error al actualizar lista de seguimiento:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Mercado de Acciones</h1>
        <p className="text-gray-400">Explora y negocia las mejores acciones del mercado</p>
      </div>

      {/* Filters */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por símbolo o nombre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">Todas las categorías</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="symbol">Símbolo</option>
                <option value="name">Nombre</option>
                <option value="current_price">Precio</option>
                <option value="change_percent">Cambio %</option>
                <option value="volume">Volumen</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white hover:bg-gray-700 transition"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex space-x-2 overflow-x-auto">
        {[
          { key: 'all', label: 'Todas', icon: null },
          { key: 'gainers', label: 'Ganadoras', icon: TrendingUp },
          { key: 'losers', label: 'Perdedoras', icon: TrendingDown },
          { key: 'trending', label: 'Tendencia', icon: Star },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-cyan-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {tab.icon && <tab.icon className="w-4 h-4 mr-2" />}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Stocks Grid */}
      {stocks.length === 0 ? (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="py-12 text-center">
            <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No se encontraron acciones</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {stocks.map((stock) => (
            <Link key={stock.id} href={`/dashboard/market/${stock.symbol}`}>
              <Card className="bg-white/5 border-white/10 hover:border-cyan-500 transition group cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-bold text-white">{stock.symbol}</h3>
                        {!stock.is_market_open && (
                          <span className="text-xs px-2 py-0.5 bg-gray-700 text-gray-400 rounded">
                            Cerrado
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 line-clamp-1">{stock.name}</p>
                    </div>
                    <button
                      onClick={(e) => handleToggleWatchlist(stock.id, e)}
                      className="text-gray-400 hover:text-cyan-400 transition"
                    >
                      <Star className={`w-5 h-5 ${stock.is_in_watchlist ? 'fill-cyan-400 text-cyan-400' : ''}`} />
                    </button>
                  </div>

                  <div className="mb-4">
                    <div className="text-2xl font-bold text-white mb-1">
                      ${(stock.current_price || stock.price)?.toFixed(2)}
                    </div>
                    <div className={`flex items-center text-sm ${
                      (stock.change_percent || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {(stock.change_percent || 0) >= 0 ? (
                        <TrendingUp className="w-4 h-4 mr-1" />
                      ) : (
                        <TrendingDown className="w-4 h-4 mr-1" />
                      )}
                      {(stock.change_percent || 0) >= 0 ? '+' : ''}
                      ${(stock.change_amount || 0)?.toFixed(2)} ({(stock.change_percent || 0)?.toFixed(2)}%)
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                    <span className="text-xs text-gray-400">
                      Vol: {(stock.volume || 0)?.toLocaleString()}
                    </span>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="text-xs">
                        <Eye className="w-3 h-3 mr-1" />
                        Ver
                      </Button>
                      <Button 
                        size="sm" 
                        className="text-xs bg-gradient-to-r from-cyan-500 to-blue-500"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          window.location.href = `dashboard/trade?stock=${stock.id}&type=buy`;
                        }}
                      >
                        Comprar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}