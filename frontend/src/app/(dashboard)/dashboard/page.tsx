'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  TrendingUp, 
  Wallet, 
  Activity, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card2';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();
  const [portfolioData, setPortfolioData] = useState({
    totalValue: 0,
    dailyChange: 0,
    dailyChangePercent: 0,
    holdings: [] as any[]
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user) {
      const mockData = {
        totalValue: 15840.50,
        dailyChange: 320.15,
        dailyChangePercent: 2.06,
        holdings: [
          { symbol: 'AAPL', name: 'Apple Inc.', shares: 10, value: 1750, change: 2.3 },
          { symbol: 'GOOGL', name: 'Alphabet Inc.', shares: 5, value: 1420, change: -1.2 },
          { symbol: 'MSFT', name: 'Microsoft', shares: 8, value: 2680, change: 1.8 },
        ]
      };
      setPortfolioData(mockData);
    }
  }, [isAuthenticated, loading, user, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Cargando...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const userName = user.name?.split(' ')[0] || 'Usuario';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Bienvenido, {userName}
        </h1>
        <p className="text-gray-400">Aquí está el resumen de tu portafolio hoy</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Saldo Disponible */}
        <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                <Wallet className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-1">Saldo Disponible</p>
            <p className="text-2xl font-bold text-white">
              $10,000.00
            </p>
          </CardContent>
        </Card>

        {/* Valor del Portafolio */}
        <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-1">Valor Total</p>
            <p className="text-2xl font-bold text-white">
              ${portfolioData.totalValue.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        {/* Cambio Diario */}
        <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-1">Cambio Hoy</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-green-400">
                +${portfolioData.dailyChange.toFixed(2)}
              </p>
              <span className="flex items-center text-sm text-green-400">
                <ArrowUpRight className="w-4 h-4" />
                {portfolioData.dailyChangePercent}%
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Ganancias/Pérdidas */}
        <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-400" />
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-1">Total P&L</p>
            <p className="text-2xl font-bold text-green-400">
              +$1,240.50
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Holdings Table */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <h2 className="text-xl font-bold text-white">Tus Posiciones</h2>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Símbolo</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Nombre</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Acciones</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Valor</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Cambio</th>
                </tr>
              </thead>
              <tbody>
                {portfolioData.holdings.map((holding) => (
                  <tr 
                    key={holding.symbol}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => router.push(`/dashboard/market/${holding.symbol}`)}
                  >
                    <td className="py-4 px-4">
                      <span className="font-semibold text-white">{holding.symbol}</span>
                    </td>
                    <td className="py-4 px-4 text-gray-300">{holding.name}</td>
                    <td className="py-4 px-4 text-right text-white">{holding.shares}</td>
                    <td className="py-4 px-4 text-right text-white">
                      ${holding.value.toFixed(2)}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className={`flex items-center justify-end gap-1 ${
                        holding.change >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {holding.change >= 0 ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4" />
                        )}
                        {Math.abs(holding.change)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card 
          className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border-cyan-500/20 hover:border-cyan-500/40 transition-all cursor-pointer"
          onClick={() => router.push('/dashboard/trade')}
        >
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Comprar/Vender</h3>
            <p className="text-gray-400 text-sm">Realiza operaciones en el mercado</p>
          </CardContent>
        </Card>

        <Card 
          className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20 hover:border-green-500/40 transition-all cursor-pointer"
          onClick={() => router.push('/dashboard/market')}
        >
          <CardContent className="p-6 text-center">
            <Activity className="w-8 h-8 text-green-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Ver Mercado</h3>
            <p className="text-gray-400 text-sm">Explora acciones disponibles</p>
          </CardContent>
        </Card>

        <Card 
          className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20 hover:border-purple-500/40 transition-all cursor-pointer"
          onClick={() => router.push('/dashboard/portfolio')}
        >
          <CardContent className="p-6 text-center">
            <Wallet className="w-8 h-8 text-purple-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Mi Portafolio</h3>
            <p className="text-gray-400 text-sm">Gestiona tus inversiones</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}