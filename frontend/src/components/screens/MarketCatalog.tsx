import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Grid3x3, 
  List, 
  TrendingUp, 
  TrendingDown,
  Eye,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  Star
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Slider } from '../ui/slider';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Skeleton } from '../ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '../ui/context-menu';
import { toast } from 'sonner@2.0.3';

interface Stock {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  category: string;
  marketCap: string;
}

interface MarketCatalogProps {
  onNavigate?: (route: string, data?: any) => void;
}

export function MarketCatalog({ onNavigate }: MarketCatalogProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Modal state para stock info
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [showStockModal, setShowStockModal] = useState(false);

  // Filter states
  const [maxPriceLimit, setMaxPriceLimit] = useState(1000); // The upper limit (editable in input)
  const [selectedMaxPrice, setSelectedMaxPrice] = useState(1000); // The current slider value
  const [maxPriceInput, setMaxPriceInput] = useState('1000');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [volumeFilter, setVolumeFilter] = useState('all');
  
  // Favorites state - loaded from localStorage
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('tikalinvest-favorites');
    return saved ? JSON.parse(saved) : [];
  });

  // Stock data state - populated from Yahoo Finance
  const [allStocks, setAllStocks] = useState<Stock[]>([]);

  const categories = [
    { id: 'tech', label: 'Tecnología', count: 5 },
    { id: 'finance', label: 'Finanzas', count: 2 },
    { id: 'retail', label: 'Retail', count: 2 },
    { id: 'automotive', label: 'Automotriz', count: 1 },
    { id: 'entertainment', label: 'Entretenimiento', count: 2 },
    { id: 'aerospace', label: 'Aeroespacial', count: 1 },
    { id: 'consumer', label: 'Consumo', count: 1 },
    { id: 'pharma', label: 'Farmacéutica', count: 1 },
  ];

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('tikalinvest-favorites', JSON.stringify(favorites));
    // Dispatch custom event to notify other components (like Dashboard)
    window.dispatchEvent(new Event('favorites-updated'));
  }, [favorites]);

  // Simulate loading
  useEffect(() => {
    if (allStocks.length === 0) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [allStocks]);

  // Cargar datos de Yahoo Finance
  useEffect(() => {
    const getCategoryForStock = (symbol: string): string => {
      // Mapeo de símbolos a categorías
      const categoryMap: { [key: string]: string } = {
        'AAPL': 'tech', 'GOOGL': 'tech', 'MSFT': 'tech', 'NVDA': 'tech', 'META': 'tech', 'ADBE': 'tech', 'CRM': 'tech', 'ORCL': 'tech', 'IBM': 'tech', 'INTC': 'tech', 'AMD': 'tech',
        'JPM': 'finance', 'V': 'finance', 'UNH': 'finance', 'MA': 'finance',
        'WMT': 'retail', 'AMZN': 'retail', 'HD': 'retail', 'MCD': 'retail',
        'TSLA': 'automotive',
        'DIS': 'entertainment', 'NFLX': 'entertainment',
        'BA': 'aerospace',
        'KO': 'consumer', 'PG': 'consumer',
        'PFE': 'pharma', 'JNJ': 'pharma',
        'CAT': 'industrial', 'GE': 'industrial', 'MMM': 'industrial'
      };
      return categoryMap[symbol] || 'tech';
    };

    const fetchMarketsData = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        console.log('Intentando conectar a:', API_BASE_URL + '/stocks/popular/');
        
        const response = await fetch(`${API_BASE_URL}/stocks/popular/`);
        console.log('Response status:', response.status);
        
        const data = await response.json();
        console.log('Datos recibidos:', data);
        
        if (data.success && data.stocks) {
          console.log('Stocks disponibles:', data.stocks.length);
          // Convertir datos de Yahoo Finance al formato esperado
          const stocks = data.stocks.map((stock: any, index: number) => ({
            id: String(index + 1),
            symbol: stock.symbol,
            name: stock.name,
            price: stock.price,
            change: stock.change,
            changePercent: stock.changePercent,
            volume: (stock.volume / 1000000).toFixed(1) + 'M',
            category: getCategoryForStock(stock.symbol),
            marketCap: stock.marketCap ? '$' + (stock.marketCap / 1000000000).toFixed(1) + 'B' : 'N/A'
          }));
          console.log('Stocks procesados:', stocks.length);
          setAllStocks(stocks);
          console.log('Datos de Yahoo Finance cargados en MarketCatalog:', stocks);
        } else {
          console.log('No hay datos en la respuesta:', data);
        }
      } catch (error) {
        console.error('Error cargando datos de Yahoo Finance:', error);
      }
    };

    fetchMarketsData();
  }, []);

  // Filter stocks
  const filteredStocks = allStocks.filter(stock => {
    const matchesSearch = 
      stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPrice = stock.price >= 0 && stock.price <= selectedMaxPrice;
    
    const matchesCategory = 
      selectedCategories.length === 0 || 
      selectedCategories.includes(stock.category);
    
    const volumeValue = parseFloat(stock.volume);
    const matchesVolume = 
      volumeFilter === 'all' ||
      (volumeFilter === 'high' && volumeValue > 50) ||
      (volumeFilter === 'medium' && volumeValue >= 20 && volumeValue <= 50) ||
      (volumeFilter === 'low' && volumeValue < 20);

    return matchesSearch && matchesPrice && matchesCategory && matchesVolume;
  });

  // Pagination
  const totalPages = Math.ceil(filteredStocks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStocks = filteredStocks.slice(startIndex, endIndex);

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setMaxPriceLimit(1000);
    setSelectedMaxPrice(1000);
    setMaxPriceInput('1000');
    setVolumeFilter('all');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleBuyStock = (stock: Stock) => {
    onNavigate?.('trading', { symbol: stock.symbol, action: 'buy' });
  };

  const handleViewStock = (stock: Stock) => {
    setSelectedStock(stock);
    setShowStockModal(true);
  };

  const toggleFavorite = (stock: Stock) => {
    const isFavorite = favorites.includes(stock.symbol);
    if (isFavorite) {
      setFavorites(prev => prev.filter(symbol => symbol !== stock.symbol));
      toast.success(`${stock.symbol} eliminado de favoritos`);
    } else {
      setFavorites(prev => [...prev, stock.symbol]);
      toast.success(`${stock.symbol} agregado a favoritos`);
    }
  };

  const handleSliderChange = (value: number[]) => {
    setSelectedMaxPrice(value[0]);
    setCurrentPage(1);
  };

  const handleMaxPriceInputChange = (value: string) => {
    setMaxPriceInput(value);
  };

  const handleMaxPriceInputBlur = () => {
    const numValue = parseInt(maxPriceInput);
    if (!isNaN(numValue) && numValue > 0) {
      setMaxPriceLimit(numValue);
      // If the selected price is higher than the new limit, adjust it
      if (selectedMaxPrice > numValue) {
        setSelectedMaxPrice(numValue);
      }
      setCurrentPage(1);
    } else {
      // If invalid, restore the previous value
      setMaxPriceInput(maxPriceLimit.toString());
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 md:px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl text-neutral-900 mb-2">Catálogo de Acciones</h1>
              <p className="text-neutral-600">
                Explora {allStocks.length} acciones disponibles para invertir
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  type="text"
                  placeholder="Buscar por ticker o nombre..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* View Mode Toggle */}
              <div className="flex border border-neutral-200 rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={viewMode === 'grid' ? 'bg-brand-primary' : ''}
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className={viewMode === 'table' ? 'bg-brand-primary' : ''}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              {/* Mobile Filter Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden"
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-6 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters Sidebar */}
          {showFilters && (
            <aside className="w-full md:w-72 flex-shrink-0">
              <Card className="sticky top-24">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Filtros</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={clearFilters}
                    className="text-brand-primary h-auto p-0"
                  >
                    Limpiar todo
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Price Range */}
                  <div>
                    <Label className="mb-3 block">Rango de Precio</Label>
                    <Slider
                      min={0}
                      max={maxPriceLimit}
                      step={10}
                      value={[selectedMaxPrice]}
                      onValueChange={handleSliderChange}
                      className="mb-3"
                    />
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-neutral-600">$0</span>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-neutral-500">Límite: $</span>
                          <Input
                            type="number"
                            min="1"
                            value={maxPriceInput}
                            onChange={(e) => handleMaxPriceInputChange(e.target.value)}
                            onBlur={handleMaxPriceInputBlur}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleMaxPriceInputBlur();
                              }
                            }}
                            className="w-20 h-7 text-sm px-2"
                          />
                        </div>
                        <span className="text-xs text-neutral-600">Actual: ${selectedMaxPrice}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      El slider va de $0 hasta el límite que definas
                    </p>
                  </div>

                  {/* Volume Filter */}
                  <div>
                    <Label className="mb-3 block">Volumen de Operaciones</Label>
                    <Select value={volumeFilter} onValueChange={(value) => {
                      setVolumeFilter(value);
                      setCurrentPage(1);
                    }}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="high">Alto (&gt;50M)</SelectItem>
                        <SelectItem value="medium">Medio (20M-50M)</SelectItem>
                        <SelectItem value="low">Bajo (&lt;20M)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Categories */}
                  <div>
                    <Label className="mb-3 block">Categoría</Label>
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {categories.map((category) => (
                        <div key={category.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={category.id}
                            checked={selectedCategories.includes(category.id)}
                            onCheckedChange={() => handleCategoryToggle(category.id)}
                          />
                          <label
                            htmlFor={category.id}
                            className="flex-1 text-sm cursor-pointer flex items-center justify-between"
                          >
                            <span>{category.label}</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Active Filters */}
                  {(selectedCategories.length > 0 || selectedMaxPrice < maxPriceLimit || volumeFilter !== 'all') && (
                    <div>
                      <Label className="mb-2 block text-xs text-neutral-500">Filtros Activos</Label>
                      <div className="flex flex-wrap gap-2">
                        {selectedCategories.map(catId => {
                          const cat = categories.find(c => c.id === catId);
                          return (
                            <Badge 
                              key={catId} 
                              variant="secondary"
                              className="cursor-pointer hover:bg-neutral-300"
                              onClick={() => handleCategoryToggle(catId)}
                            >
                              {cat?.label} <X className="h-3 w-3 ml-1" />
                            </Badge>
                          );
                        })}
                        {volumeFilter !== 'all' && (
                          <Badge 
                            variant="secondary"
                            className="cursor-pointer hover:bg-neutral-300"
                            onClick={() => setVolumeFilter('all')}
                          >
                            Volumen: {volumeFilter} <X className="h-3 w-3 ml-1" />
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </aside>
          )}

          {/* Results */}
          <main className="flex-1 min-w-0">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-neutral-600">
                {isLoading ? (
                  'Cargando...'
                ) : (
                  <>
                    Mostrando <span className="text-neutral-900">{currentStocks.length}</span> de{' '}
                    <span className="text-neutral-900">{filteredStocks.length}</span> resultados
                  </>
                )}
              </p>
            </div>

            {/* Loading State */}
            {isLoading && (
              <>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                      <Card key={i}>
                        <CardContent className="p-6">
                          <Skeleton className="h-6 w-20 mb-2" />
                          <Skeleton className="h-4 w-32 mb-4" />
                          <Skeleton className="h-8 w-24 mb-4" />
                          <div className="flex gap-2">
                            <Skeleton className="h-9 flex-1" />
                            <Skeleton className="h-9 flex-1" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Símbolo</TableHead>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Precio</TableHead>
                            <TableHead>Cambio</TableHead>
                            <TableHead>Volumen</TableHead>
                            <TableHead>Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {[...Array(6)].map((_, i) => (
                            <TableRow key={i}>
                              <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                              <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {/* Empty State */}
            {!isLoading && filteredStocks.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 mb-4">
                    <Search className="h-8 w-8 text-neutral-400" />
                  </div>
                  <h3 className="text-xl text-neutral-900 mb-2">
                    No se encontraron acciones
                  </h3>
                  <p className="text-neutral-600 mb-6">
                    Intenta ajustar los filtros o la búsqueda para encontrar lo que necesitas
                  </p>
                  <Button onClick={clearFilters} variant="outline">
                    Limpiar filtros
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Grid View */}
            {!isLoading && viewMode === 'grid' && currentStocks.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentStocks.map((stock) => {
                  const isFavorite = favorites.includes(stock.symbol);
                  return (
                    <ContextMenu key={stock.id}>
                      <ContextMenuTrigger>
                        <Card 
                          className="border-2 border-neutral-200 hover:border-brand-primary hover:shadow-lg transition-all duration-300 group relative"
                        >
                          {isFavorite && (
                            <div className="absolute top-3 right-3 z-10">
                              <Star className="h-5 w-5 text-warning fill-warning" />
                            </div>
                          )}
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <div className="text-2xl text-neutral-900 group-hover:text-brand-primary transition-colors">
                                  {stock.symbol}
                                </div>
                                <div className="text-sm text-neutral-500">{stock.name}</div>
                              </div>
                              {stock.changePercent >= 0 ? (
                                <TrendingUp className="h-5 w-5 text-success" />
                              ) : (
                                <TrendingDown className="h-5 w-5 text-danger" />
                              )}
                            </div>

                            <div className="mb-4">
                              <div className="text-3xl text-neutral-900 mb-1">
                                ${stock.price.toFixed(2)}
                              </div>
                              <Badge 
                                variant="secondary"
                                className={stock.changePercent >= 0 ? 'bg-success-light text-success' : 'bg-danger-light text-danger'}
                              >
                                {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent}% (${stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)})
                              </Badge>
                            </div>

                            <div className="flex items-center justify-between mb-4 text-sm text-neutral-500">
                              <span>Vol: {stock.volume}</span>
                              <span>Cap: {stock.marketCap}</span>
                            </div>

                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1 hover:border-brand-primary hover:text-brand-primary transition-colors"
                                onClick={() => handleViewStock(stock)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Ver
                              </Button>
                              <Button 
                                size="sm" 
                                className="flex-1 bg-brand-primary hover:bg-brand-primary/90"
                                onClick={() => handleBuyStock(stock)}
                              >
                                <ShoppingCart className="h-4 w-4 mr-1" />
                                Comprar
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </ContextMenuTrigger>
                      <ContextMenuContent>
                        <ContextMenuItem onClick={() => toggleFavorite(stock)}>
                          <Star className={`h-4 w-4 mr-2 ${isFavorite ? 'fill-warning text-warning' : ''}`} />
                          {isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                        </ContextMenuItem>
                        <ContextMenuItem onClick={() => handleViewStock(stock)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver detalles
                        </ContextMenuItem>
                        <ContextMenuItem onClick={() => handleBuyStock(stock)}>
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Comprar
                        </ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>
                  );
                })}
              </div>
            )}

            {/* Table View */}
            {!isLoading && viewMode === 'table' && currentStocks.length > 0 && (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Símbolo</TableHead>
                          <TableHead>Nombre</TableHead>
                          <TableHead className="text-right">Precio</TableHead>
                          <TableHead className="text-right">Cambio</TableHead>
                          <TableHead>Volumen</TableHead>
                          <TableHead>Cap. Mercado</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentStocks.map((stock) => {
                          const isFavorite = favorites.includes(stock.symbol);
                          return (
                            <ContextMenu key={stock.id}>
                              <ContextMenuTrigger asChild>
                                <TableRow className="hover:bg-neutral-50 transition-colors">
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      {isFavorite && (
                                        <Star className="h-4 w-4 text-warning fill-warning" />
                                      )}
                                      {stock.changePercent >= 0 ? (
                                        <TrendingUp className="h-4 w-4 text-success" />
                                      ) : (
                                        <TrendingDown className="h-4 w-4 text-danger" />
                                      )}
                                      <span className="text-neutral-900">{stock.symbol}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-neutral-600">{stock.name}</TableCell>
                                  <TableCell className="text-right text-neutral-900">
                                    ${stock.price.toFixed(2)}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex flex-col items-end">
                                      <span className={stock.changePercent >= 0 ? 'text-success' : 'text-danger'}>
                                        {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent}%
                                      </span>
                                      <span className="text-xs text-neutral-500">
                                        ${stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
                                      </span>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-neutral-600">{stock.volume}</TableCell>
                                  <TableCell className="text-neutral-600">{stock.marketCap}</TableCell>
                                  <TableCell>
                                    <div className="flex gap-2 justify-end">
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => handleViewStock(stock)}
                                        className="hover:bg-brand-primary/10 hover:text-brand-primary"
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                      <Button 
                                        size="sm"
                                        className="bg-brand-primary hover:bg-brand-primary/90"
                                        onClick={() => handleBuyStock(stock)}
                                      >
                                        <ShoppingCart className="h-4 w-4 mr-1" />
                                        Comprar
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              </ContextMenuTrigger>
                              <ContextMenuContent>
                                <ContextMenuItem onClick={() => toggleFavorite(stock)}>
                                  <Star className={`h-4 w-4 mr-2 ${isFavorite ? 'fill-warning text-warning' : ''}`} />
                                  {isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                                </ContextMenuItem>
                                <ContextMenuItem onClick={() => handleViewStock(stock)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Ver detalles
                                </ContextMenuItem>
                                <ContextMenuItem onClick={() => handleBuyStock(stock)}>
                                  <ShoppingCart className="h-4 w-4 mr-2" />
                                  Comprar
                                </ContextMenuItem>
                              </ContextMenuContent>
                            </ContextMenu>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pagination */}
            {!isLoading && filteredStocks.length > 0 && totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-neutral-600">
                  Página {currentPage} de {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>
                  
                  {/* Page Numbers */}
                  <div className="hidden sm:flex gap-1">
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={i}
                          variant={currentPage === pageNum ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className={currentPage === pageNum ? 'bg-brand-primary' : ''}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Stock Info Modal */}
      <Dialog open={showStockModal} onOpenChange={setShowStockModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-xl font-bold">{selectedStock?.symbol}</span>
              <Badge variant={selectedStock?.change! >= 0 ? "default" : "destructive"}>
                {selectedStock?.changePercent! >= 0 ? "+" : ""}{selectedStock?.changePercent?.toFixed(2)}%
              </Badge>
            </DialogTitle>
            <DialogDescription>
              {selectedStock?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Precio */}
            <div className="bg-neutral-50 p-4 rounded-lg">
              <div className="text-sm text-neutral-600 mb-1">Precio Actual</div>
              <div className="text-3xl font-bold text-neutral-900">
                ${selectedStock?.price?.toFixed(2)}
              </div>
              <div className={`text-sm font-medium mt-1 ${selectedStock?.change! >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {selectedStock?.change! >= 0 ? "↑" : "↓"} ${Math.abs(selectedStock?.change!).toFixed(2)}
              </div>
            </div>

            {/* Información */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-neutral-50 p-3 rounded-lg">
                <div className="text-xs text-neutral-600 mb-1">Volumen</div>
                <div className="font-semibold text-neutral-900">{selectedStock?.volume}</div>
              </div>
              <div className="bg-neutral-50 p-3 rounded-lg">
                <div className="text-xs text-neutral-600 mb-1">Cap. Mercado</div>
                <div className="font-semibold text-neutral-900">{selectedStock?.marketCap}</div>
              </div>
            </div>

            {/* Categoría */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-600">Categoría:</span>
              <Badge variant="outline">
                {selectedStock?.category}
              </Badge>
            </div>

            {/* Acciones */}
            <div className="flex gap-2 pt-2">
              <Button 
                className="flex-1"
                onClick={() => {
                  if (selectedStock) {
                    handleBuyStock(selectedStock);
                    setShowStockModal(false);
                  }
                }}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Comprar
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  if (selectedStock) {
                    toggleFavorite(selectedStock);
                  }
                }}
                className={favorites.includes(selectedStock?.symbol!) ? "text-yellow-500" : ""}
              >
                <Star className={`h-4 w-4 ${favorites.includes(selectedStock?.symbol!) ? 'fill-current' : ''}`} />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
