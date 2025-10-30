'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card2';
import { Button } from '@/components/ui/button2';
import { 
  Users, 
  DollarSign, 
  Copy, 
  Check, 
  Share2,
  TrendingUp,
  UserCheck,
  Clock,
  Gift
} from 'lucide-react';
import { toast } from 'sonner';
import { getReferrals, getReferralStats, getCurrentUser } from '@/lib/api';

interface Referral {
  id: number;
  referred_user: {
    id: number;
    name: string;
    email: string;
    username: string;
  };
  status: 'active' | 'inactive' | 'pending';
  earnings_generated: number;
  created_at: string;
  activated_at: string | null;
}

interface ReferralStats {
  total_referrals: number;
  active_referrals: number;
  pending_referrals: number;
  total_earnings: number;
  pending_earnings: number;
}

export default function ReferralsPage() {
  const { user, isLoading: authLoading } = useUser();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [referralCode, setReferralCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (user && !authLoading) {
      loadReferralData();
    }
  }, [user, authLoading]);

  const loadReferralData = async () => {
    setIsLoading(true);
    try {
      const [userResponse, referralsResponse, statsResponse] = await Promise.all([
        getCurrentUser(),
        getReferrals(),
        getReferralStats()
      ]);

      const userData = userResponse.user || userResponse;
      setReferralCode(userData.referral_code);
      setReferrals(referralsResponse.results || referralsResponse);
      setStats(statsResponse);
    } catch (error) {
      console.error('Error loading referral data:', error);
      toast.error('Error al cargar datos de referidos');
    } finally {
      setIsLoading(false);
    }
  };

  const copyReferralCode = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralCode);
      setCopiedCode(true);
      toast.success('Código copiado al portapapeles');
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const shareReferralLink = () => {
    if (referralCode) {
      const referralLink = `${window.location.origin}/auth/register?ref=${referralCode}`;
      navigator.clipboard.writeText(referralLink);
      setCopiedLink(true);
      toast.success('Link de referido copiado');
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-500/20 text-green-400',
      pending: 'bg-yellow-500/20 text-yellow-400',
      inactive: 'bg-gray-500/20 text-gray-400'
    };

    const labels = {
      active: 'Activo',
      pending: 'Pendiente',
      inactive: 'Inactivo'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando programa de referidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Programa de Referidos</h1>
        <p className="text-gray-400">Invita a tus amigos y gana recompensas</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-1">Total Referidos</p>
              <p className="text-2xl font-bold text-white">{stats.total_referrals}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-green-400" />
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-1">Referidos Activos</p>
              <p className="text-2xl font-bold text-green-400">{stats.active_referrals}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-purple-400" />
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-1">Ganancias Totales</p>
              <p className="text-2xl font-bold text-purple-400">${stats.total_earnings.toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-1">Ganancias Pendientes</p>
              <p className="text-2xl font-bold text-yellow-400">${stats.pending_earnings.toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Referral Code Card */}
      <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Gift className="w-6 h-6 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Comparte tu Código de Referido</h3>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-gray-400 text-sm mb-2">Tu código único:</p>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold text-white bg-white/10 px-6 py-3 rounded-lg flex-1 text-center">
                  {referralCode}
                </div>
                <Button
                  onClick={copyReferralCode}
                  variant="outline"
                  className="border-white/10 text-gray-300 hover:bg-white/10 px-6"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-4 h-4 mr-2 text-green-400" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={shareReferralLink}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Link Copiado
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 mr-2" />
                    Compartir Link
                  </>
                )}
              </Button>
            </div>

            <div className="mt-4 p-4 bg-white/5 rounded-lg">
              <h4 className="text-white font-semibold mb-2">¿Cómo funciona?</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">•</span>
                  <span>Comparte tu código o link con tus amigos</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">•</span>
                  <span>Ellos reciben <strong className="text-white">$100 de bono</strong> al registrarse con tu código</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">•</span>
                  <span>Tú ganas <strong className="text-white">$50</strong> cuando realizan su primera inversión</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">•</span>
                  <span>¡Sin límite de referidos! Mientras más invites, más ganas</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referrals List */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <h2 className="text-xl font-semibold text-white">Mis Referidos ({referrals.length})</h2>
        </CardHeader>
        <CardContent>
          {referrals.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Aún no tienes referidos</h3>
              <p className="text-gray-400 mb-6">Comparte tu código y comienza a ganar</p>
              <Button onClick={shareReferralLink} className="bg-cyan-500 hover:bg-cyan-600">
                <Share2 className="w-4 h-4 mr-2" />
                Compartir Ahora
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-400 border-b border-gray-700">
                    <th className="pb-3 px-4">Usuario</th>
                    <th className="pb-3 px-4">Email</th>
                    <th className="pb-3 px-4 text-center">Estado</th>
                    <th className="pb-3 px-4 text-right">Ganancias</th>
                    <th className="pb-3 px-4">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.map((referral) => (
                    <tr key={referral.id} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-semibold text-white">{referral.referred_user.name}</p>
                          <p className="text-sm text-gray-400">@{referral.referred_user.username}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-300">
                        {referral.referred_user.email}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {getStatusBadge(referral.status)}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className={`font-semibold ${
                          referral.earnings_generated > 0 ? 'text-green-400' : 'text-gray-400'
                        }`}>
                          ${referral.earnings_generated.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-400 text-sm">
                        {formatDate(referral.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Benefits Card */}
      <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-green-400" />
            <h3 className="text-lg font-semibold text-white">Maximiza tus Ganancias</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2">🎯 Comparte Estratégicamente</h4>
              <p className="text-sm text-gray-300">Comparte con personas interesadas en inversiones para mejores resultados</p>
            </div>
            
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2">💡 Educa a tus Referidos</h4>
              <p className="text-sm text-gray-300">Ayúdalos a entender el valor de la plataforma para que se mantengan activos</p>
            </div>
            
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2">📈 Sin Límites</h4>
              <p className="text-sm text-gray-300">Puedes referir a cuantas personas quieras, sin tope de ganancias</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}