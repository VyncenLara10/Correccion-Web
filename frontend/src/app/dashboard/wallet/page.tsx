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

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'trade' | 'dividend';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

interface WalletData {
  balance: number;
  available: number;
  invested: number;
  total_pl: number;
  daily_change: number;
  transactions: Transaction[];
}

export default function WalletPage() {
  const { user, isLoading } = useUser();
  const [walletData, setWalletData] = useState<WalletData>({
    balance: 10000.00,
    available: 7500.00,
    invested: 2500.00,
    total_pl: 500.75,
    daily_change: 125.50,
    transactions: [
      {
        id: '1',
        type: 'deposit',
        amount: 5000,
        description: 'Depósito inicial',
        date: '2024-01-15T10:30:00Z',
        status: 'completed'
      },
      {
        id: '2',
        type: 'trade',
        amount: -1500,
        description: 'Compra AAPL',
        date: '2024-01-16T14:20:00Z',
        status: 'completed'
      },
      {
        id: '3',
        type: 'trade',
        amount: -1000,
        description: 'Compra MSFT',
        date: '2024-01-17T11:15:00Z',
        status: 'completed'
      },
      {
        id: '4',
        type: 'dividend',
        amount: 25.75,
        description: 'Dividendo AAPL',
        date: '2024-01-18T09:00:00Z',
        status: 'completed'
      },
      {
        id: '5',
        type: 'deposit',
        amount: 2000,
        description: 'Depósito adicional',
        date: '2024-01-19T16:45:00Z',
        status: 'pending'
      }
    ]
  });

  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (user) {
      loadWalletData();
    }
  }, [user]);

  const loadWalletData = async () => {
    try {
      const tokenResponse = await fetch('/api/auth/token');
      const tokenData = await tokenResponse.json();
      
      if (tokenData.accessToken) {
        const walletResponse = await fetch('http://localhost:8000/api/wallet', {
          headers: {
            'Authorization': `Bearer ${tokenData.accessToken}`
          }
        });

        if (walletResponse.ok) {
          const data = await walletResponse.json();
          setWalletData(data.wallet);
        }
      }
    } catch (error) {
      console.error('Error loading wallet data:', error);
    }
  };

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Ingresa un monto válido');
      return;
    }

    setProcessing(true);
    try {
      // Simular procesamiento de depósito
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const depositAmount = parseFloat(amount);
      setWalletData(prev => ({
        ...prev,
        balance: prev.balance + depositAmount,
        available: prev.available + depositAmount,
        transactions: [
          {
            id: Date.now().toString(),
            type: 'deposit',
            amount: depositAmount,
            description: 'Depósito en línea',
            date: new Date().toISOString(),
            status: 'completed'
          },
          ...prev.transactions
        ]
      }));

      toast.success(`Depósito de $${depositAmount} procesado exitosamente`);
      setShowDepositModal(false);
      setAmount('');
    } catch (error) {
      toast.error('Error al procesar el depósito');
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
    if (withdrawalAmount > walletData.available) {
      toast.error('Fondos insuficientes');
      return;
    }

    setProcessing(true);
    try {
      // Simular procesamiento de retiro
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setWalletData(prev => ({
        ...prev,
        balance: prev.balance - withdrawalAmount,
        available: prev.available - withdrawalAmount,
        transactions: [
          {
            id: Date.now().toString(),
            type: 'withdrawal',
            amount: -withdrawalAmount,
            description: 'Retiro a cuenta bancaria',
            date: new Date().toISOString(),
            status: 'pending'
          },
          ...prev.transactions
        ]
      }));

      toast.success(`Retiro de $${withdrawalAmount} solicitado`);
      setShowWithdrawModal(false);
      setAmount('');
    } catch (error) {
      toast.error('Error al procesar el retiro');
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando billetera...</p>
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

      {/* Wallet Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Balance Card */}
        <Card className="bg-gradient-to-br from-cyan-500/10 to-teal-500/5 border-cyan-500/20 lg:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-gray-400 text-sm">Saldo Total</p>
                <p className="text-4xl font-bold text-white mt-2">
                  {formatCurrency(walletData.balance)}
                </p>
              </div>
              <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center">
                <Wallet className="w-8 h-8 text-cyan-400" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400 text-sm">Disponible</p>
                <p className="text-xl font-semibold text-white">
                  {formatCurrency(walletData.available)}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Invertido</p>
                <p className="text-xl font-semibold text-white">
                  {formatCurrency(walletData.invested)}
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => setShowDepositModal(true)}
                className="flex-1 bg-cyan-500 hover:bg-cyan-600"
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
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Ganancias/Pérdidas</p>
                  <p className={`text-lg font-semibold ${
                    walletData.total_pl >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {walletData.total_pl >= 0 ? '+' : ''}{formatCurrency(walletData.total_pl)}
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
          <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white/10">
            <History className="w-4 h-4 mr-2" />
            Ver Todas
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {walletData.transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.type === 'deposit' ? 'bg-green-500/20' :
                    transaction.type === 'withdrawal' ? 'bg-red-500/20' :
                    transaction.type === 'dividend' ? 'bg-blue-500/20' :
                    'bg-yellow-500/20'
                  }`}>
                    {transaction.type === 'deposit' && <Upload className="w-5 h-5 text-green-400" />}
                    {transaction.type === 'withdrawal' && <Download className="w-5 h-5 text-red-400" />}
                    {transaction.type === 'dividend' && <DollarSign className="w-5 h-5 text-blue-400" />}
                    {transaction.type === 'trade' && <TrendingUp className="w-5 h-5 text-yellow-400" />}
                  </div>
                  <div>
                    <p className="font-medium text-white">{transaction.description}</p>
                    <p className="text-gray-400 text-sm">{formatDate(transaction.date)}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className={`font-semibold ${
                    transaction.amount > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
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
                  onClick={() => setShowDepositModal(false)}
                  variant="outline"
                  className="flex-1 border-white/10 text-gray-300 hover:bg-white/10"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleDeposit}
                  disabled={processing || !amount}
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
                  className="bg-white/5 border-white/10 text-white text-lg"
                />
                <p className="text-gray-400 text-sm mt-2">
                  Disponible: {formatCurrency(walletData.available)}
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => setShowWithdrawModal(false)}
                  variant="outline"
                  className="flex-1 border-white/10 text-gray-300 hover:bg-white/10"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleWithdrawal}
                  disabled={processing || !amount || parseFloat(amount) > walletData.available}
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