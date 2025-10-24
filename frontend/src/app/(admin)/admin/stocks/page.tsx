'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Edit, Trash2, Plus, Power, PowerOff } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card2';
import { Button } from '@/components/ui/button2';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/bagde';
import { getStocks, toggleStockActive, deleteStock } from '@/lib/api';

export default function AdminStocksPage() {
  const [stocks, setStocks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadStocks();
  }, []);

  const loadStocks = async () => {
    setIsLoading(true);
    try {
      const data = await getStocks();
      setStocks(data.stocks || []);

    } catch (error) {
      console.error('Error al cargar acciones:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (stockId: string) => {
    try {
      await toggleStockActive(stockId);
      await loadStocks();
      alert('Estado actualizado');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar estado');
    }
  };

  const handleDelete = async (stockId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta acción?')) return;
    
    try {
      await deleteStock(stockId);
      await loadStocks();
      alert('Acción eliminada');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar acción');
    }
  };

  const filteredStocks = stocks.filter(stock =>
    stock.symbol?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="text-white text-center py-20">
        <p className="text-xl">Cargando acciones...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Gestión de Acciones</h1>
          <p className="text-gray-400">Administra las acciones disponibles en la plataforma</p>
        </div>
        <Button className="bg-gradient-to-r from-cyan-500 to-blue-500">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Acción
        </Button>
      </div>

      {/* Search */}
      <Card className="bg-white/5 border-white/10 mb-6">
        <CardContent className="p-4">
          <Input
            type="text"
            placeholder="Buscar por símbolo o nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white/5 border-white/10 text-white"
          />
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Acciones</p>
                <h3 className="text-3xl font-bold text-white">{stocks.length}</h3>
              </div>
              <TrendingUp className="w-8 h-8 text-cyan-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Activas</p>
                <h3 className="text-3xl font-bold text-green-400">
                  {stocks.filter(s => s.is_active).length}
                </h3>
              </div>
              <Power className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Inactivas</p>
                <h3 className="text-3xl font-bold text-red-400">
                  {stocks.filter(s => !s.is_active).length}
                </h3>
              </div>
              <PowerOff className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Volumen Total</p>
                <h3 className="text-3xl font-bold text-purple-400">
                  {(stocks.reduce((sum, s) => sum + (s.volume || 0), 0) / 1000000).toFixed(1)}M
                </h3>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <h2 className="text-xl font-bold text-white">Lista de Acciones</h2>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Símbolo</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Nombre</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Precio</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Cambio 24h</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Disponibles</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Estado</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredStocks.map((stock) => (
                  <tr key={stock.id} className="border-b border-white/10 hover:bg-white/5">
                    <td className="py-4 px-4">
                      <span className="text-cyan-400 font-bold">{stock.symbol}</span>
                    </td>
                    <td className="py-4 px-4 text-white">{stock.name}</td>
                    <td className="py-4 px-4 text-white">${stock.price?.toFixed(2)}</td>
                    <td className="py-4 px-4">
                      <span className={stock.change_24h >= 0 ? 'text-green-400' : 'text-red-400'}>
                        {stock.change_24h >= 0 ? '+' : ''}{stock.change_24h?.toFixed(2)}%
                      </span>
                    </td>
                    <td className="py-4 px-4 text-white">{stock.available_quantity}</td>
                    <td className="py-4 px-4">
                      <Badge className={stock.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                        {stock.is_active ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleActive(stock.id)}
                          className="text-gray-400 hover:text-white"
                        >
                          {stock.is_active ? (
                            <PowerOff className="w-4 h-4" />
                          ) : (
                            <Power className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-gray-400 hover:text-cyan-400"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(stock.id)}
                          className="text-gray-400 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredStocks.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              No se encontraron acciones
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}