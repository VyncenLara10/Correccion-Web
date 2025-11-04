import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Download, Filter, Plus, Minus } from 'lucide-react';
import { Button } from '../ui/button';

interface TradeTransaction {
  id: string;
  symbol: string;
  name: string;
  type: 'buy' | 'sell';
  transaction_type?: 'buy' | 'sell';
  shares: number;
  pricePerShare?: number;
  price_per_share?: number;
  total: number;
  date: string;
  created_at?: string;
}

export function History() {
  const [transactions, setTransactions] = useState<TradeTransaction[]>([]);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Cargar transacciones desde el backend
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        const token = localStorage.getItem('access_token');

        if (!token) {
          // Fallback a localStorage si no hay token
          const savedTransactions = localStorage.getItem('userTransactions');
          if (savedTransactions) {
            setTransactions(JSON.parse(savedTransactions));
          }
          return;
        }

        const response = await fetch(`${API_BASE_URL}/portfolio/transactions/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.results) {
            // Convertir formato del backend al frontend
            const backendTransactions = data.results.map((tx: any) => ({
              id: tx.id,
              symbol: tx.symbol,
              name: tx.name,
              type: tx.transaction_type,
              shares: parseFloat(tx.shares),
              pricePerShare: parseFloat(tx.price_per_share),
              total: parseFloat(tx.total),
              date: new Date(tx.created_at).toLocaleString('es-ES'),
            }));
            setTransactions(backendTransactions);
            localStorage.setItem('userTransactions', JSON.stringify(backendTransactions));
          }
        } else {
          // Fallback a localStorage
          const savedTransactions = localStorage.getItem('userTransactions');
          if (savedTransactions) {
            setTransactions(JSON.parse(savedTransactions));
          }
        }
      } catch (error) {
        console.error('Error cargando transacciones:', error);
        // Fallback a localStorage
        const savedTransactions = localStorage.getItem('userTransactions');
        if (savedTransactions) {
          setTransactions(JSON.parse(savedTransactions));
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();

    // Escuchar cambios en localStorage
    const handleStorageChange = () => {
      const updated = localStorage.getItem('userTransactions');
      if (updated) {
        setTransactions(JSON.parse(updated));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesType = filterType === 'all' || transaction.type === filterType;
    const matchesSearch =
      transaction.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const totalBuy = transactions
    .filter((t) => t.type === 'buy')
    .reduce((sum, t) => sum + t.total, 0);
  
  const totalSell = transactions
    .filter((t) => t.type === 'sell')
    .reduce((sum, t) => sum + t.total, 0);

  const netBalance = totalSell - totalBuy;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border bg-gradient-to-br from-danger/10">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Total Compras</p>
            <h3 className="mt-2 text-2xl font-bold text-danger">${totalBuy.toFixed(2)}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {transactions.filter((t: TradeTransaction) => t.type === 'buy').length} transacciones
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-gradient-to-br from-success/10">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Total Ventas</p>
            <h3 className="mt-2 text-2xl font-bold text-success">${totalSell.toFixed(2)}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {transactions.filter((t: TradeTransaction) => t.type === 'sell').length} transacciones
            </p>
          </CardContent>
        </Card>

        <Card className={`border-border bg-gradient-to-br ${netBalance >= 0 ? 'from-success/10' : 'from-warning/10'}`}>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Balance Neto</p>
            <h3 className={`mt-2 text-2xl font-bold ${netBalance >= 0 ? 'text-success' : 'text-warning'}`}>
              ${Math.abs(netBalance).toFixed(2)}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {netBalance >= 0 ? 'Ganancia neta' : 'Inversión neta'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Historial de Transacciones</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm">Buscar</label>
              <Input
                type="text"
                placeholder="Buscar por símbolo o nombre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-input-background"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm">Tipo</label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="bg-input-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="buy">Compras</SelectItem>
                  <SelectItem value="sell">Ventas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <div className="space-y-3">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((transaction) => (
            <Card key={transaction.id} className="border-border hover:bg-neutral-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className={`p-2 rounded-lg ${
                        transaction.type === 'buy' ? 'bg-danger/10' : 'bg-success/10'
                      }`}
                    >
                      {transaction.type === 'buy' ? (
                        <Plus className={`h-4 w-4 text-danger`} />
                      ) : (
                        <Minus className={`h-4 w-4 text-success`} />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">
                        {transaction.symbol} - {transaction.name}
                      </p>
                      <p className="text-sm text-muted-foreground">{transaction.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {transaction.shares} {transaction.shares === 1 ? 'acción' : 'acciones'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      @ ${transaction.pricePerShare ? parseFloat(String(transaction.pricePerShare)).toFixed(2) : '0.00'}
                    </p>
                    <p
                      className={`font-semibold mt-1 ${
                        transaction.type === 'buy' ? 'text-danger' : 'text-success'
                      }`}
                    >
                      {transaction.type === 'buy' ? '-' : '+'}${transaction.total ? parseFloat(String(transaction.total)).toFixed(2) : '0.00'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="border-border">
            <CardContent className="p-12 text-center">
              <Filter className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {transactions.length === 0
                  ? 'Aún no tienes transacciones'
                  : 'No se encontraron transacciones'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
