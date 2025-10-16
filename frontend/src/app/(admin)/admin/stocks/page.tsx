'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card2';
import {Button} from '@/components/ui/button2';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, Search, Plus, Edit, Trash2, Power, PowerOff } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function AdminStocksPage() {
  const [stocks, setStocks] = useState<any[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadStocks();
  }, []);

  useEffect(() => {
    filterStocks();
  }, [searchQuery, stocks]);

  const loadStocks = async () => {
    setIsLoading(true);
    try {
      const data = await api.getStocks();
      setStocks(data.results || data);
    } catch (error) {
      toast.error('Error al cargar acciones');
    } finally {
      setIsLoading(false);
    }
  };

  const filterStocks = () => {
    let filtered = [...stocks];

    if (searchQuery) {
      filtered = filtered.filter(s =>
        s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredStocks(filtered);
  };

  const toggleTradable = async (stockId: string, currentStatus: boolean) => {
    try {
      // await api.updateStock(stockId, { is_tradable: !currentStatus });
      toast.success(
        !currentStatus 
          ? 'Acción habilitada para trading' 
          : 'Acción deshabilitada para trading'
      );
      loadStocks();
    } catch (error) {
      toast.error('Error al actualizar el estado');
    }
  };

  const toggleActive = async (stockId: string, currentStatus: boolean) => {
    try {
      // await api.updateStock(stockId, { is_active: !currentStatus });
      toast.success(
        !currentStatus 
          ? 'Acción activada' 
          : 'Acción desactivada'
      );
      loadStocks();
    } catch (error) {
      toast.error('Error al actualizar el estado');
    }
  };

  const handleDelete = async (stockId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta acción?')) return;
    
    try {
      // await api.deleteStock(stockId);
      toast.success('Acción eliminada');
      loadStocks();
    } catch (error) {
      toast.error('Error al eliminar la acción');
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Gestión de Acciones</h1>
          <p className="text-gray-400">Administra el catálogo de acciones disponibles</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-5 h-5 mr-2" />
          Agregar Acción
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Total Acciones</p>
                <p className="text-2xl font-bold text-white">{stocks.length}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Activas</p>
                <p className="text-2xl font-bold text-white">
                  {stocks.filter(s => s.is_active).length}
                </p>
              </div>
              <Power className="w-8 h-8 text-success-DEFAULT" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Trading Habilitado</p>
                <p className="text-2xl font-bold text-white">
                  {stocks.filter(s => s.is_tradable).length}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Trading Deshabilitado</p>
                <p className="text-2xl font-bold text-white">
                  {stocks.filter(s => !s.is_tradable).length}
                </p>
              </div>
              <PowerOff className="w-8 h-8 text-danger-DEFAULT" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por símbolo o nombre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-900/50 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stocks Table */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones ({filteredStocks.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredStocks.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No se encontraron acciones</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-400 border-b border-gray-700">
                    <th className="pb-3">Símbolo</th>
                    <th className="pb-3">Nombre</th>
                    <th className="pb-3">Precio</th>
                    <th className="pb-3">Mercado</th>
                    <th className="pb-3 text-center">Estado</th>
                    <th className="pb-3 text-center">Trading</th>
                    <th className="pb-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStocks.map((stock) => (
                    <tr key={stock.id} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                      <td className="py-4">
                        <span className="font-bold text-white">{stock.symbol}</span>
                      </td>
                      <td className="py-4">
                        <div>
                          <p className="font-semibold text-white">{stock.name}</p>
                          <p className="text-sm text-gray-400">{stock.company_name}</p>
                        </div>
                      </td>
                      <td className="py-4 text-white font-semibold">
                        {formatCurrency(stock.current_price)}
                      </td>
                      <td className="py-4 text-gray-400">{stock.market}</td>
                      <td className="py-4 text-center">
                        <button
                          onClick={() => toggleActive(stock.id, stock.is_active)}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition ${
                            stock.is_active
                              ? 'bg-success-DEFAULT/10 text-success-DEFAULT hover:bg-success-DEFAULT/20'
                              : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                          }`}
                        >
                          {stock.is_active ? (
                            <>
                              <Power className="w-3 h-3 mr-1" />
                              Activa
                            </>
                          ) : (
                            <>
                              <PowerOff className="w-3 h-3 mr-1" />
                              Inactiva
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-4 text-center">
                        <button
                          onClick={() => toggleTradable(stock.id, stock.is_tradable)}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition ${
                            stock.is_tradable
                              ? 'bg-primary-500/10 text-primary-500 hover:bg-primary-500/20'
                              : 'bg-danger-DEFAULT/10 text-danger-DEFAULT hover:bg-danger-DEFAULT/20'
                          }`}
                        >
                          {stock.is_tradable ? (
                            <>
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Habilitado
                            </>
                          ) : (
                            <>
                              <PowerOff className="w-3 h-3 mr-1" />
                              Deshabilitado
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            className="p-2 text-gray-400 hover:text-primary-500 transition"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(stock.id)}
                            className="p-2 text-gray-400 hover:text-danger-DEFAULT transition"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-primary-500/10 border-primary-500/20">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <TrendingUp className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-primary-200">
              <p className="font-semibold mb-2">Control de Trading</p>
              <ul className="space-y-1">
                <li>• <strong>Estado Activo/Inactivo:</strong> Controla si la acción es visible en la plataforma</li>
                <li>• <strong>Trading Habilitado/Deshabilitado:</strong> Controla si los usuarios pueden comprar/vender esta acción</li>
                <li>• Las acciones deshabilitadas para trading no aparecerán en el mercado de usuarios</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}