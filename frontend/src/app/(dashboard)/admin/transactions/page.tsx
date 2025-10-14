'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { ArrowDownRight, ArrowUpRight, Filter, Calendar, Download } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
  const [filterType, setFilterType] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [filterType, startDate, endDate, transactions]);

  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      const data = await api.getTransactions({ limit: 100 });
      setTransactions(data.results || data);
    } catch (error) {
      toast.error('Error al cargar transacciones');
    } finally {
      setIsLoading(false);
    }
  };

  const filterTransactions = () => {
    let filtered = [...transactions];

    if (filterType !== 'all') {
      filtered = filtered.filter(tx => tx.transaction_type === filterType);
    }

    if (startDate) {
      filtered = filtered.filter(tx => new Date(tx.created_at) >= new Date(startDate));
    }
    if (endDate) {
      filtered = filtered.filter(tx => new Date(tx.created_at) <= new Date(endDate));
    }

    setFilteredTransactions(filtered);
  };

  const getTotalByType = (type: string) => {
    return transactions
      .filter(tx => tx.transaction_type === type && tx.status === 'completed')
      .reduce((sum, tx) => sum + parseFloat(tx.total_amount), 0);
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
        <h1 className="text-3xl font-bold text-white mb-2">Todas las Transacciones</h1>
        <p className="text-gray-400">Monitorea todas las operaciones de la plataforma</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Total Transacciones</p>
                <p className="text-2xl font-bold text-white">{transactions.length}</p>
              </div>
              <Download className="w-8 h-8 text-primary-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Total Compras</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(getTotalByType('buy'))}
                </p>
              </div>
              <ArrowDownRight className="w-8 h-8 text-danger-DEFAULT" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Total Ventas</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(getTotalByType('sell'))}
                </p>
              </div>
              <ArrowUpRight className="w-8 h-8 text-success-DEFAULT" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Comisiones</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(transactions.reduce((sum, tx) => sum + (parseFloat(tx.commission) || 0), 0))}
                </p>
              </div>
              <Download className="w-8 h-8 text-primary-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">Todas</option>
                <option value="buy">Compras</option>
                <option value="sell">Ventas</option>
              </select>
            </div>

            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <button
              onClick={() => {
                setFilterType('all');
                setStartDate('');
                setEndDate('');
              }}
              className="bg-gray-800 hover:bg-gray-700 text-white font-medium py-2.5 rounded-lg transition"
            >
              Limpiar Filtros
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transacciones ({filteredTransactions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Download className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No se encontraron transacciones</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-400 border-b border-gray-700">
                    <th className="pb-3">Fecha</th>
                    <th className="pb-3">Usuario</th>
                    <th className="pb-3">Tipo</th>
                    <th className="pb-3">Acción</th>
                    <th className="pb-3 text-right">Cantidad</th>
                    <th className="pb-3 text-right">Precio</th>
                    <th className="pb-3 text-right">Comisión</th>
                    <th className="pb-3 text-right">Total</th>
                    <th className="pb-3 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                      <td className="py-4 text-sm text-gray-400">
                        {formatDateTime(tx.created_at)}
                      </td>
                      <td className="py-4">
                        <div>
                          <p className="text-white font-medium">{tx.user_email}</p>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center">
                          {tx.transaction_type === 'buy' ? (
                            <>
                              <ArrowDownRight className="w-4 h-4 text-danger-DEFAULT mr-2" />
                              <span className="text-danger-DEFAULT font-medium">Compra</span>
                            </>
                          ) : (
                            <>
                              <ArrowUpRight className="w-4 h-4 text-success-DEFAULT mr-2" />
                              <span className="text-success-DEFAULT font-medium">Venta</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="font-semibold text-white">{tx.stock_detail?.symbol || 'N/A'}</span>
                      </td>
                      <td className="py-4 text-right text-white">{tx.quantity}</td>
                      <td className="py-4 text-right text-white">
                        {formatCurrency(tx.price_per_share)}
                      </td>
                      <td className="py-4 text-right text-gray-400">
                        {formatCurrency(tx.commission)}
                      </td>
                      <td className="py-4 text-right">
                        <span className={`font-semibold ${
                          tx.transaction_type === 'buy' ? 'text-danger-DEFAULT' : 'text-success-DEFAULT'
                        }`}>
                          {tx.transaction_type === 'buy' ? '-' : '+'}
                          {formatCurrency(tx.total_amount)}
                        </span>
                      </td>
                      <td className="py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          tx.status === 'completed' ? 'bg-success-DEFAULT/10 text-success-DEFAULT' :
                          tx.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                          'bg-danger-DEFAULT/10 text-danger-DEFAULT'
                        }`}>
                          {tx.status === 'completed' ? 'Completada' :
                           tx.status === 'pending' ? 'Pendiente' : 'Fallida'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}