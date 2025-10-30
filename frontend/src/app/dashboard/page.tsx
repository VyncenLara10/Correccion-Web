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
  Users,
  Copy,
  Check,
  Share2
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card2';
import { Button } from '@/components/ui/button2';
import { toast } from 'sonner';
import { 
  getDashboardStats,
  getPortfolio,
  getReferralStats,
  getCurrentUser
} from '@/lib/api';

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
  quantity: number;
  average_buy_price: number;
  current_price: number;
  current_value: number;
  profit_loss_percentage: number;
}

interface PortfolioSummary {
  total_value: number;
  available_balance: number;
  invested_amount: number;
  daily_change: number;
  daily_change_percent: number;
  total_profit_loss: number;
  holdings: Holding[];
}

interface ReferralStats {
  total_referrals: number;
  active_referrals: number;
  total_earnings: number;
  pending_earnings: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user: auth0User, error, isLoading } = useUser();
  const [djangoUser, setDjangoUser] = useState<DjangoUser | null>(null);
  const [portfolioData, setPortfolioData] = useState<PortfolioSummary | null>(null);
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

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

    if (auth0User && !djangoUser && !loadingData) {
      loadDashboardData();
    }
  }, [auth0User, isLoading, error, router, djangoUser, loadingData]);

  const loadDashboardData = async () => {
    setLoadingData(true);
    try {
      // Cargar datos del usuario Django
      const userData = await getCurrentUser();
      setDjangoUser(userData.user || userData);

      // Cargar portafolio y referidos en paralelo
      const [portfolioResponse, referralsResponse] = await Promise.all([
        getPortfolio().catch(() => null),
        getReferralStats().catch(() => null)
      ]);

      if (portfolioResponse) {
        // Construir resumen del portafolio
        const holdings = portfolioResponse.results || portfolioResponse.holdings || [];
        const summary = {
          total_value: holdings.reduce((sum: number, h: any) => sum + parseFloat(h.current_value || 0), 0),
          available_balance: userData.user?.balance || userData.balance || 0,
          invested_amount: holdings.reduce((sum: number, h: any) => sum + (parseFloat(h.average_buy_price || 0) * parseFloat(h.quantity || 0)), 0),
          daily_change: 0, // Calcular desde el backend si está disponible
          daily_change_percent: 0,
          total_profit_loss: holdings.reduce((sum: number, h: any) => sum + parseFloat(h.profit_loss || 0), 0),
          holdings: holdings.map((h: any) => ({
            symbol: h.stock?.symbol || h.symbol,
            name: h.stock?.name || h.name,
            quantity: h.quantity,
            average_buy_price: h.average_buy_price,
            current_price: h.stock?.current_price || h.current_price,
            current_value: h.current_value,
            profit_loss_percentage: h.profit_loss_percentage || 0
          }))
        };
        setPortfolioData(summary);
      }

      if (referralsResponse) {
        setReferralStats(referralsResponse);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Error al cargar datos del dashboard');
    } finally {
      setLoadingData(false);
    }
  };

  const copyReferralCode = () => {
    if (djangoUser?.referral_code) {
      navigator.clipboard.writeText(djangoUser.referral_code);
      setCopiedCode(true);
      toast.success('Código copiado al portapapeles');
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const shareReferralLink = () => {
    if (djangoUser?.referral_code) {
      const referralLink = `${window.location.origin}/auth/register?ref=${djangoUser.referral_code}`;
      navigator.clipboard.writeText(referralLink);
      toast.success('Link de referido copiado');
    }
  };

  if (isLoading || loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!auth0User) {
    return null;
  }

  const userName = djangoUser?.name || auth0User.name?.split(' ')[0] || 'Usuario';
  const userBalance = djangoUser?.balance || 0;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Bienvenido, {userName}
        </h1>
        <p className="text-gray-400">Dashboard de Trading - Tikal Invest</p>
        
        {djangoUser && (
          <div className="mt-4 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
            <p className="text-green-400 flex items-center gap-2 mb-2">
               Conectado con Django 
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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
              ${userBalance.toFixed(2)}
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
              ${portfolioData?.total_value.toFixed(2) || '0.00'}
            </p>
          </CardContent>
        </Card>

        {/* Monto Invertido */}
        <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-1">Invertido</p>
            <p className="text-2xl font-bold text-white">
              ${portfolioData?.invested_amount.toFixed(2) || '0.00'}
            </p>
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
              (portfolioData?.total_profit_loss || 0) >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {(portfolioData?.total_profit_loss || 0) >= 0 ? '+' : ''}$
              {portfolioData?.total_profit_loss.toFixed(2) || '0.00'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Referral Section - Mejorado */}
      {djangoUser && (
        <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-6 h-6 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Programa de Referidos</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <p className="text-gray-400 text-sm mb-2">Tu código de referido:</p>
                <div className="flex items-center gap-2">
                  <p className="text-xl font-bold text-white bg-white/10 px-4 py-2 rounded-lg flex-1">
                    {djangoUser.referral_code}
                  </p>
                  <Button
                    onClick={copyReferralCode}
                    variant="outline"
                    className="border-white/10 text-gray-300 hover:bg-white/10"
                  >
                    {copiedCode ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {referralStats && (
                <>
                  <div>
                    <p className="text-gray-400 text-sm mb-2">Referidos totales:</p>
                    <p className="text-2xl font-bold text-white">{referralStats.total_referrals}</p>
                    <p className="text-sm text-green-400">{referralStats.active_referrals} activos</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-2">Ganancias por referidos:</p>
                    <p className="text-2xl font-bold text-green-400">${referralStats.total_earnings.toFixed(2)}</p>
                    <p className="text-sm text-gray-400">${referralStats.pending_earnings.toFixed(2)} pendientes</p>
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={shareReferralLink}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Compartir Link de Referido
              </Button>
              <Button
                onClick={() => router.push('/dashboard/referrals')}
                variant="outline"
                className="border-white/10 text-gray-300 hover:bg-white/10"
              >
                Ver Mis Referidos
              </Button>
            </div>

            <div className="mt-4 p-4 bg-white/5 rounded-lg">
              <p className="text-sm text-gray-300">
                <strong className="text-white">Beneficios:</strong> Gana $50 por cada amigo que se registre con tu código. 
                Tu amigo recibe $100 de bono de bienvenida. ¡Es un win-win!
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Holdings Table */}
      {portfolioData && portfolioData.holdings.length > 0 && (
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Tus Posiciones</h2>
              <Button
                onClick={() => router.push('/dashboard/portfolio')}
                variant="outline"
                className="border-white/10 text-gray-300 hover:bg-white/10"
              >
                Ver Todo
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Símbolo</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Nombre</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-medium">Cantidad</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-medium">Valor</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-medium">Cambio</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolioData.holdings.slice(0, 5).map((holding) => (
                    <tr 
                      key={holding.symbol}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() => router.push(`/dashboard/market/${holding.symbol}`)}
                    >
                      <td className="py-4 px-4">
                        <span className="font-semibold text-white">{holding.symbol}</span>
                      </td>
                      <td className="py-4 px-4 text-gray-300">{holding.name}</td>
                      <td className="py-4 px-4 text-right text-white">{holding.quantity}</td>
                      <td className="py-4 px-4 text-right text-white">
                        ${holding.current_value.toFixed(2)}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className={`flex items-center justify-end gap-1 ${
                          holding.profit_loss_percentage >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {holding.profit_loss_percentage >= 0 ? (
                            <ArrowUpRight className="w-4 h-4" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4" />
                          )}
                          {holding.profit_loss_percentage >= 0 ? '+' : ''}
                          {holding.profit_loss_percentage.toFixed(2)}%
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
          onClick={() => router.push('/dashboard/wallet')}
        >
          <CardContent className="p-6 text-center">
            <Wallet className="w-8 h-8 text-purple-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Mi Billetera</h3>
            <p className="text-gray-400 text-sm">Gestiona tus fondos</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}