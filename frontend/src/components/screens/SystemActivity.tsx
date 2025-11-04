import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Download,
  Filter
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

const API_BASE_URL = 'http://localhost:8000/api';

interface Transaction {
  id: string;
  user: string;
  email: string;
  action: string;
  symbol: string;
  name: string;
  shares: number;
  price_per_share: number;
  total: number;
  type: string;
  timestamp: string;
  status: string;
}

interface TodayRevenue {
  revenue: number;
  transaction_count: number;
  buy_count: number;
  sell_count: number;
  date: string;
}

export function SystemActivity() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [todayRevenue, setTodayRevenue] = useState<TodayRevenue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<'all' | 'buy' | 'sell'>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        };

        // Fetch transactions
        const txResponse = await fetch(`${API_BASE_URL}/admin/transactions_detailed/`, { headers });
        if (txResponse.ok) {
          setTransactions(await txResponse.json());
        }

        // Fetch today revenue
        const revenueResponse = await fetch(`${API_BASE_URL}/admin/today_revenue/`, { headers });
        if (revenueResponse.ok) {
          setTodayRevenue(await revenueResponse.json());
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching system activity data:', err);
        setError('Error al cargar los datos');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredTransactions = transactions.filter(tx => {
    if (typeFilter === 'all') return true;
    return tx.type === typeFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-success text-white">Completado</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-warning-light text-warning">Pendiente</Badge>;
      case 'failed':
        return <Badge variant="destructive">Fallido</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const exportToCSV = () => {
    if (transactions.length === 0) {
      alert('No hay transacciones para exportar');
      return;
    }

    // Crear el CSV
    const headers = ['Timestamp', 'Usuario', 'Email', 'Tipo', 'Símbolo', 'Acciones', 'Precio Unitario', 'Total', 'Estado'];
    const rows = transactions.map(tx => [
      new Date(tx.timestamp).toLocaleString('es-ES'),
      tx.user,
      tx.email,
      tx.type === 'buy' ? 'Compra' : 'Venta',
      tx.symbol,
      tx.shares.toString(),
      `$${tx.price_per_share.toLocaleString('es-ES', { maximumFractionDigits: 2 })}`,
      `$${tx.total.toLocaleString('es-ES', { maximumFractionDigits: 2 })}`,
      tx.status
    ]);

    // Convertir a CSV
    const csvContent = [
      headers.join(','),
      ...rows.map(row => 
        row.map(cell => {
          // Escapar comillas y envolver en comillas si contiene comas
          const escaped = String(cell).replace(/"/g, '""');
          return escaped.includes(',') ? `"${escaped}"` : escaped;
        }).join(',')
      )
    ].join('\n');

    // Descargar
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `transacciones_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {loading && <div className="text-center py-10">Cargando datos...</div>}
      {error && <div className="text-center py-10 text-red-500">{error}</div>}

      {!loading && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Actividad del Sistema</h1>
              <p className="text-neutral-500">
                Monitoreo en tiempo real de todas las transacciones
              </p>
            </div>
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="mr-2 h-4 w-4" />
              Exportar Logs
            </Button>
          </div>

          {/* Stats Cards */}
          {todayRevenue && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-neutral-500 mb-1">Total de Transacciones</p>
                      <p className="text-2xl font-bold">{todayRevenue.transaction_count}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-brand-primary-light flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-brand-primary" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-neutral-500">
                      {todayRevenue.buy_count} compras • {todayRevenue.sell_count} ventas
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-neutral-500 mb-1">Ingresos Hoy</p>
                      <p className="text-2xl font-bold">
                        ${todayRevenue.revenue.toLocaleString('es-ES', { maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-financial-positive-light flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-financial-positive" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <span className="text-neutral-500">Fecha: {new Date(todayRevenue.date).toLocaleDateString('es-ES')}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-neutral-500 mb-1">Promedio por Transacción</p>
                      <p className="text-2xl font-bold">
                        ${todayRevenue.transaction_count > 0 
                          ? (todayRevenue.revenue / todayRevenue.transaction_count).toLocaleString('es-ES', { maximumFractionDigits: 2 })
                          : '0'
                        }
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-info-light flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-info" />
                    </div>
                  </div>
                  <div className="text-sm text-neutral-500">Por transacción completada</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Activity Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Detalles de Transacciones</CardTitle>
                <Select value={typeFilter} onValueChange={(value: any) => setTypeFilter(value)}>
                  <SelectTrigger className="w-[150px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="buy">Compras</SelectItem>
                    <SelectItem value="sell">Ventas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Símbolo</TableHead>
                      <TableHead>Acciones</TableHead>
                      <TableHead>Precio Unitario</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((tx) => (
                      <TableRow key={tx.id} className="hover:bg-neutral-50">
                        <TableCell className="font-mono text-sm">
                          {new Date(tx.timestamp).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{tx.user}</p>
                            <p className="text-xs text-neutral-500">{tx.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={tx.type === 'buy' 
                              ? 'bg-financial-positive-light text-financial-positive' 
                              : 'bg-financial-negative-light text-financial-negative'
                            }
                          >
                            {tx.type === 'buy' ? 'Compra' : 'Venta'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-bold">{tx.symbol}</TableCell>
                        <TableCell>{tx.shares.toLocaleString('es-ES', { maximumFractionDigits: 4 })}</TableCell>
                        <TableCell>${tx.price_per_share.toLocaleString('es-ES', { maximumFractionDigits: 2 })}</TableCell>
                        <TableCell className="font-bold">${tx.total.toLocaleString('es-ES', { maximumFractionDigits: 2 })}</TableCell>
                        <TableCell>{getStatusBadge(tx.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {filteredTransactions.length === 0 && (
                  <div className="text-center py-12">
                    <DollarSign className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                    <p className="text-neutral-500">No hay transacciones para mostrar</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
