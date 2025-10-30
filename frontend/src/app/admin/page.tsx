'use client';

import { useEffect, useState } from 'react';
import { Users, TrendingUp, DollarSign, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card2';
import { getAdminDashboardStats } from '@/lib/api';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // CONECTA CON: GET /api/admin/reports/dashboard
      const data = await getAdminDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-white">Cargando...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Panel de Administración</h1>
        <p className="text-gray-400">Vista general del sistema</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Usuarios</p>
                <h3 className="text-3xl font-bold text-white">
                  {stats?.total_users || 0}
                </h3>
                <p className="text-green-400 text-sm mt-1">
                  +{stats?.new_users_this_month || 0} este mes
                </p>
              </div>
              <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Volumen Total</p>
                <h3 className="text-3xl font-bold text-white">
                  ${(stats?.total_volume || 0).toLocaleString()}
                </h3>
                <p className="text-green-400 text-sm mt-1">
                  +{stats?.volume_growth || 0}% vs mes anterior
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Ingresos</p>
                <h3 className="text-3xl font-bold text-white">
                  ${(stats?.total_revenue || 0).toLocaleString()}
                </h3>
                <p className="text-green-400 text-sm mt-1">
                  Comisiones del mes
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Transacciones</p>
                <h3 className="text-3xl font-bold text-white">
                  {stats?.total_transactions || 0}
                </h3>
                <p className="text-cyan-400 text-sm mt-1">
                  Hoy: {stats?.transactions_today || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <h2 className="text-xl font-bold text-white">Usuarios Recientes</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recent_users?.map((user: any) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <p className="text-white font-medium">{user.name}</p>
                    <p className="text-gray-400 text-sm">{user.email}</p>
                  </div>
                  <span className="text-gray-400 text-sm">
                    {new Date(user.created_at).toLocaleDateString()}
                  </span>
                </div>
              )) || <p className="text-gray-400 text-center py-8">No hay datos</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <h2 className="text-xl font-bold text-white">Transacciones Recientes</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recent_transactions?.map((tx: any) => (
                <div key={tx.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <p className="text-white font-medium">{tx.stock_symbol}</p>
                    <p className="text-gray-400 text-sm">{tx.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">${tx.total}</p>
                    <span className="text-gray-400 text-sm">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )) || <p className="text-gray-400 text-center py-8">No hay datos</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}