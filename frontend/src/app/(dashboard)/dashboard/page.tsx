'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@auth0/nextjs-auth0/client';
import { 
  TrendingUp, 
  Wallet, 
  Activity, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Users
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card2';

interface DjangoUser {
  id: number;
  username: string;
  email: string;
  name: string;
  role: string;
  balance: number;
  referral_code: string;
  is_verified: boolean;
  date_joined: string;
}

interface Holding {
  symbol: string;
  name: string;
  shares: number;
  avg_price: number;
  current_price: number;
  value: number;
  change_percent: number;
}

interface PortfolioData {
  total_value: number;
  available_balance: number;
  invested_amount: number;
  daily_change: number;
  daily_change_percent: number;
  total_pl: number;
  holdings: Holding[];
}

export default function DashboardPage() {
  const router = useRouter();
  const { user: auth0User, error, isLoading } = useUser();
  const [djangoUser, setDjangoUser] = useState<DjangoUser | null>(null);
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [loadingDjango, setLoadingDjango] = useState(false);

  useEffect(() => {
    if (error) {
      console.error('Auth error:', error);
      router.push('/auth/login');
      return;
    }

    if (!isLoading && !auth0User) {
      router.push('/auth/login');
      return;
    }

    if (auth0User && !djangoUser && !loadingDjango) {
      verifyWithDjango();
    }
  }, [auth0User, isLoading, error, router, djangoUser, loadingDjango]);

  const verifyWithDjango = async () => {
    setLoadingDjango(true);
    try {
      // Obtener token de acceso de Auth0
      const tokenResponse = await fetch('/api/auth/token');
      const tokenData = await tokenResponse.json();
      
      if (!tokenData.accessToken) {
        throw new Error('No access token available');
      }

      // Verificar/crear usuario en Django
      const verifyResponse = await fetch('http://localhost:8000/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenData.accessToken}`
        },
        body: JSON.stringify({ 
          email: auth0User!.email,
          name: auth0User!.name,
          sub: auth0User!.sub 
        })
      });

      if (verifyResponse.ok) {
        const verifyData = await verifyResponse.json();
        setDjangoUser(verifyData.user);
        
        // Cargar datos del portfolio
        await loadPortfolioData(tokenData.accessToken);
      } else {
        const errorData = await verifyResponse.json();
        console.error('Error de Django:', errorData);
      }
    } catch (error) {
      console.error('Error connecting to Django:', error);
    } finally {
      setLoadingDjango(false);
    }
  };

  const loadPortfolioData = async (token: string) => {
    try {
      const portfolioResponse = await fetch('http://localhost:8000/api/portfolio', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (portfolioResponse.ok) {
        const portfolioData = await portfolioResponse.json();
        setPortfolioData(portfolioData.portfolio);
      }
    } catch (error) {
      console.error('Error loading portfolio:', error);
    }
  };

  if (isLoading || loadingDjango) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Cargando dashboard...</div>
      </div>
    );
  }

  if (!auth0User) {
    return null;
  }

  const userName = djangoUser?.name || auth0User.name?.split(' ')[0] || 'Usuario';
  const userBalance = djangoUser?.balance || 0;
  const portfolio = portfolioData || {
    total_value: 12500.75,
    available_balance: userBalance,
    invested_amount: 7500.25,
    daily_change: 125.50,
    daily_change_percent: 1.02,
    total_pl: 500.75,
    holdings: [
      {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        shares: 10,
        avg_price: 150.25,
        current_price: 155.50,
        value: 1555.00,
        change_percent: 3.5
      },
      {
        symbol: 'MSFT',
        name: 'Microsoft Corporation',
        shares: 5,
        avg_price: 300.75,
        current_price: 315.25,
        value: 1576.25,
        change_percent: 4.8
      }
    ]
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Bienvenido, {userName}
        </h1>
        <p className="text-gray-400">Dashboard de Trading - Tikal Invest</p>
        
        {djangoUser ? (
          <div className="mt-4 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
            <p className="text-green-400 flex items-center gap-2">
              ✅ Conectado con Django 
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm">
              <div>
                <span className="text-gray-400">Balance:</span>
                <p className="text-white">${userBalance.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-gray-400">Referral:</span>
                <p className="text-white">{djangoUser.referral_code}</p>
              </div>
              <div>
                <span className="text-gray-400">Rol:</span>
                <p className="text-white capitalize">{djangoUser.role}</p>
              </div>
              <div>
                <span className="text-gray-400">Verificado:</span>
                <p className={djangoUser.is_verified ? 'text-green-400' : 'text-yellow-400'}>
                  {djangoUser.is_verified ? 'Sí' : 'No'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
            <p className="text-yellow-400">
              ⚠️ Autenticado con Auth0, conectando con Django...
            </p>
          </div>
        )}
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
              ${portfolio.available_balance.toFixed(2)}
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
              ${portfolio.total_value.toFixed(2)}
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
              <p className={`text-2xl font-bold ${
                portfolio.daily_change >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {portfolio.daily_change >= 0 ? '+' : ''}${portfolio.daily_change.toFixed(2)}
              </p>
              <span className={`flex items-center text-sm ${
                portfolio.daily_change >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {portfolio.daily_change >= 0 ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : (
                  <ArrowDownRight className="w-4 h-4" />
                )}
                {Math.abs(portfolio.daily_change_percent)}%
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
            <p className={`text-2xl font-bold ${
              portfolio.total_pl >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {portfolio.total_pl >= 0 ? '+' : ''}${portfolio.total_pl.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Referral Section */}
      {djangoUser && (
        <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-6 h-6 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Programa de Referidos</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400 text-sm">Tu código de referido:</p>
                <p className="text-xl font-bold text-white bg-white/10 px-3 py-2 rounded-lg inline-block mt-1">
                  {djangoUser.referral_code}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Beneficios:</p>
                <p className="text-green-400 text-sm">$100 para tus amigos + $50 para ti</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Holdings Table */}
      {portfolio.holdings.length > 0 && (
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
                  {portfolio.holdings.map((holding) => (
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
                          holding.change_percent >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {holding.change_percent >= 0 ? (
                            <ArrowUpRight className="w-4 h-4" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4" />
                          )}
                          {Math.abs(holding.change_percent)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

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