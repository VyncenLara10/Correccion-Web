'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card2';
import { Button } from '@/components/ui/button2';
import { Input } from '@/components/ui/input';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Minus,
  History,
  Download,
  Upload
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  getWallet, 
  getWalletTransactions, 
  depositFunds, 
  withdrawFunds 
} from '@/lib/api';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'buy' | 'sell';
  amount: number;
  description: string;
  created_at: string;
  status: 'completed' | 'pending' | 'failed';
}

interface WalletData {
  balance: number;
  available_balance: number;
  invested_amount: number;
  total_profit_loss: number;
  daily_change: number;
}

export default function WalletPage() {
  const { user, isLoading: authLoading } = useUser();
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (user && !authLoading) {
      loadWalletData();
    }
  }, [user, authLoading]);

  const loadWalletData = async () => {
    setIsLoading(true);
    try {
      const [walletResponse, transactionsResponse] = await Promise.all([
        getWallet(),
        getWalletTransactions({ limit: 10 })
      ]);
      
      setWalletData(walletResponse);
      setTransactions(transactionsResponse.results || transactionsResponse);
    } catch (error) {
      console.error('Error loading wallet data:', error);
      toast.error('Error al cargar datos de la billetera');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Ingresa un monto válido');
      return;
    }

    setProcessing(true);
    try {
      await depositFunds(parseFloat(amount));
      toast.success(`Depósito de $${amount} procesado exitosamente`);
      setShowDepositModal(false);
      setAmount('');
      await loadWalletData();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Error al procesar el depósito');
    } finally {
      setProcessing(false);
    }
  };

  const handleWithdrawal = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Ingresa un monto válido');
      return;
    }

    const withdrawalAmount = parseFloat(amount);
    if (walletData && withdrawalAmount > walletData.available_balance) {
      toast.error('Fondos insuficientes');
      return;
    }

    setProcessing(true);
    try {
      await withdrawFunds(withdrawalAmount);
      toast.success(`Retiro de $${amount} solicitado`);
      setShowWithdrawModal(false);
      setAmount('');
      await loadWalletData();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Error al procesar el retiro');
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando billetera...</p>
        </div>
      </div>
    );
  }

  if (!user || !walletData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-400 mb-4">No se pudo cargar la información de la billetera</p>
          <Button onClick={loadWalletData}>Reintentar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Mi Billetera</h1>
        <p className="text-gray-400">Gestiona tus fondos y transacciones</p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Balance Card */}
        <Card className="lg:col-span-2 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Balance Total</p>
                <h2 className="text-4xl font-bold text-white">
                  {formatCurrency(walletData.balance)}
                </h2>
              </div>
              <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center">
                <Wallet className="w-8 h-8 text-cyan-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-gray-400 text-sm">Disponible</p>
                <p className="text-xl font-semibold text-white">
                  {formatCurrency(walletData.available_balance)}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Invertido</p>
                <p className="text-xl font-semibold text-white">
                  {formatCurrency(walletData.invested_amount)}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowDepositModal(true)}
                className="flex-1 bg-green-500 hover:bg-green-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Depositar
              </Button>
              <Button
                onClick={() => setShowWithdrawModal(true)}
                variant="outline"
                className="flex-1 border-white/10 text-gray-300 hover:bg-white/10"
              >
                <Minus className="w-4 h-4 mr-2" />
                Retirar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="space-y-6">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  walletData.total_profit_loss >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'
                }`}>
                  {walletData.total_profit_loss >= 0 ? (
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-400" />
                  )}
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Ganancias/Pérdidas</p>
                  <p className={`text-lg font-semibold ${
                    walletData.total_profit_loss >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {walletData.total_profit_loss >= 0 ? '+' : ''}{formatCurrency(walletData.total_profit_loss)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Cambio Hoy</p>
                  <p className={`text-lg font-semibold ${
                    walletData.daily_change >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {walletData.daily_change >= 0 ? '+' : ''}{formatCurrency(walletData.daily_change)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Transactions */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Transacciones Recientes</h2>
          <Button 
            variant="outline" 
            className="border-white/10 text-gray-300 hover:bg-white/10"
            onClick={() => window.location.href = '/dashboard/transactions'}
          >
            <History className="w-4 h-4 mr-2" />
            Ver Todas
          </Button>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Wallet className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No hay transacciones recientes</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === 'deposit' ? 'bg-green-500/20' :
                      transaction.type === 'withdrawal' ? 'bg-red-500/20' :
                      'bg-yellow-500/20'
                    }`}>
                      {transaction.type === 'deposit' && <Upload className="w-5 h-5 text-green-400" />}
                      {transaction.type === 'withdrawal' && <Download className="w-5 h-5 text-red-400" />}
                      {(transaction.type === 'buy' || transaction.type === 'sell') && (
                        <TrendingUp className="w-5 h-5 text-yellow-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-white">{transaction.description}</p>
                      <p className="text-gray-400 text-sm">{formatDate(transaction.created_at)}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.amount > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {transaction.amount > 0 ? '+' : ''}{formatCurrency(Math.abs(transaction.amount))}
                    </p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      transaction.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      transaction.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {transaction.status === 'completed' ? 'Completado' :
                       transaction.status === 'pending' ? 'Pendiente' : 'Fallido'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-[#1a1f3a] border-white/20 max-w-md w-full">
            <CardHeader>
              <h3 className="text-xl font-semibold text-white">Depositar Fondos</h3>
              <p className="text-gray-400">Ingresa el monto que deseas depositar</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Monto (USD)
                </label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="bg-white/5 border-white/10 text-white text-lg"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => setAmount('100')}
                  variant="outline"
                  className="border-white/10 text-gray-300 hover:bg-white/10"
                >
                  $100
                </Button>
                <Button
                  onClick={() => setAmount('500')}
                  variant="outline"
                  className="border-white/10 text-gray-300 hover:bg-white/10"
                >
                  $500
                </Button>
                <Button
                  onClick={() => setAmount('1000')}
                  variant="outline"
                  className="border-white/10 text-gray-300 hover:bg-white/10"
                >
                  $1,000
                </Button>
                <Button
                  onClick={() => setAmount('5000')}
                  variant="outline"
                  className="border-white/10 text-gray-300 hover:bg-white/10"
                >
                  $5,000
                </Button>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => {
                    setShowDepositModal(false);
                    setAmount('');
                  }}
                  variant="outline"
                  className="flex-1 border-white/10 text-gray-300 hover:bg-white/10"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleDeposit}
                  disabled={processing || !amount || parseFloat(amount) <= 0}
                  className="flex-1 bg-cyan-500 hover:bg-cyan-600"
                >
                  {processing ? 'Procesando...' : 'Depositar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-[#1a1f3a] border-white/20 max-w-md w-full">
            <CardHeader>
              <h3 className="text-xl font-semibold text-white">Retirar Fondos</h3>
              <p className="text-gray-400">Ingresa el monto que deseas retirar</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Monto (USD)
                </label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  max={walletData.available_balance}
                  className="bg-white/5 border-white/10 text-white text-lg"
                />
                <p className="text-gray-400 text-sm mt-2">
                  Disponible: {formatCurrency(walletData.available_balance)}
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => {
                    setShowWithdrawModal(false);
                    setAmount('');
                  }}
                  variant="outline"
                  className="flex-1 border-white/10 text-gray-300 hover:bg-white/10"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleWithdrawal}
                  disabled={processing || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > walletData.available_balance}
                  className="flex-1 bg-cyan-500 hover:bg-cyan-600"
                >
                  {processing ? 'Procesando...' : 'Retirar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}