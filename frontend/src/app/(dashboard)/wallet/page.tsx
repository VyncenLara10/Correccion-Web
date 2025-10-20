'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card2';
import {Button }from '@/components/ui/button2';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { Wallet, ArrowDownLeft, ArrowUpRight, History, CreditCard, Building2, AlertCircle } from 'lucide-react';
import {getWalletTransactions, withdrawal, deposit} from '@/lib/api';
import { toast } from 'sonner';
import { useAuth} from '@/hooks/useAuth';

export default function WalletPage() {
  const searchParams = useSearchParams();
  const { user, logout, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdrawal' | 'history'>('deposit');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setIsLoading] = useState(false);

  // Form states
  const [amount, setAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  useEffect(() => {
  const action = searchParams?.get('action');
  if (action === 'deposit' || action === 'withdrawal') {
    setActiveTab(action);
  }
  loadTransactions();
}, [searchParams]);

  const loadTransactions = async () => {
    try {
      const data = await getWalletTransactions({ limit: 10 });
      setTransactions(data.results || data);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const handleDeposit = async () => {
    const numAmount = parseFloat(amount);
    
    if (!numAmount || numAmount < 10) {
      toast.error('El monto mínimo de depósito es $10');
      return;
    }
    
    if (numAmount > 50000) {
      toast.error('El monto máximo de depósito es $50,000');
      return;
    }

    if (!bankName) {
      toast.error('Selecciona un banco');
      return;
    }

    setIsLoading(true);
    try {
      await deposit({
        amount: numAmount,
        bank_name: bankName,
        account_number: accountNumber,
      });

      toast.success('Depósito realizado exitosamente', {
        description: `Se agregaron ${formatCurrency(numAmount)} a tu cuenta`,
      });

      setAmount('');
      setBankName('');
      setAccountNumber('');
      await refreshUser();
      await loadTransactions();
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Error al procesar el depósito';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdrawal = async () => {
    const numAmount = parseFloat(amount);
    
    if (!numAmount || numAmount < 10) {
      toast.error('El monto mínimo de retiro es $10');
      return;
    }

    const fee = numAmount * 0.02;
    const total = numAmount + fee;

   if (user?.balance !== undefined && total > user.balance) {
      toast.error(`Saldo insuficiente. Necesitas ${formatCurrency(total)} (incluye comisión de ${formatCurrency(fee)})`);
      return;
    }

    if (!bankName || !accountNumber) {
      toast.error('Completa todos los campos');
      return;
    }

    setIsLoading(true);
    try {
      await withdrawal({
        amount: numAmount,
        bank_name: bankName,
        account_number: accountNumber,
      });

      toast.success('Retiro realizado exitosamente', {
        description: `Se retiraron ${formatCurrency(numAmount)} de tu cuenta`,
      });

      setAmount('');
      setBankName('');
      setAccountNumber('');
      await refreshUser();
      await loadTransactions();
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Error al procesar el retiro';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateFee = () => {
    const numAmount = parseFloat(amount) || 0;
    if (activeTab === 'deposit') {
      return numAmount * 0.015; // 1.5%
    }
    return numAmount * 0.02; // 2%
  };

  const getNetAmount = () => {
    const numAmount = parseFloat(amount) || 0;
    const fee = calculateFee();
    if (activeTab === 'deposit') {
      return numAmount - fee;
    }
    return numAmount;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Wallet</h1>
        <p className="text-gray-400">Gestiona tus fondos de inversión</p>
      </div>

      {/* Balance Card */}
      <Card className="bg-gradient-to-br from-primary-500 to-primary-600">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-100 mb-2">Balance Disponible</p>
              <p className="text-4xl font-bold text-white">{formatCurrency(user?.balance || 0)}</p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Wallet className="w-8 h-8 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex space-x-2">
        {[
          { key: 'deposit', label: 'Depositar', icon: ArrowDownLeft },
          { key: 'withdrawal', label: 'Retirar', icon: ArrowUpRight },
          { key: 'history', label: 'Historial', icon: History },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex items-center px-6 py-3 rounded-lg font-medium transition ${
              activeTab === tab.key
                ? 'bg-primary-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <tab.icon className="w-5 h-5 mr-2" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {activeTab === 'deposit' ? 'Depositar Fondos' : activeTab === 'withdrawal' ? 'Retirar Fondos' : 'Historial de Transacciones'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(activeTab === 'deposit' || activeTab === 'withdrawal') && (
              <div className="space-y-6">
                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Monto {activeTab === 'deposit' ? 'a Depositar' : 'a Retirar'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">$</span>
                    <input
                      type="number"
                      min="10"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-gray-900/50 border border-gray-700 rounded-lg pl-8 pr-4 py-3 text-white text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="0.00"
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-400">
                    Monto mínimo: $10.00 {activeTab === 'deposit' && '• Monto máximo: $50,000.00'}
                  </p>
                </div>

                {/* Quick Amounts */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Montos Rápidos</label>
                  <div className="grid grid-cols-4 gap-3">
                    {[50, 100, 500, 1000].map((value) => (
                      <button
                        key={value}
                        onClick={() => setAmount(value.toString())}
                        className="px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-white font-medium transition"
                      >
                        ${value}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bank Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Banco
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full bg-gray-900/50 border border-gray-700 rounded-lg pl-11 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Selecciona tu banco</option>
                      <option value="Banco Industrial">Banco Industrial</option>
                      <option value="Banrural">Banrural</option>
                      <option value="BAM">BAM</option>
                      <option value="Bantrab">Bantrab</option>
                      <option value="BAC">BAC</option>
                      <option value="Banco G&T Continental">Banco G&T Continental</option>
                    </select>
                  </div>
                </div>

                {/* Account Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Número de Cuenta {activeTab === 'withdrawal' && <span className="text-red-400">*</span>}
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="w-full bg-gray-900/50 border border-gray-700 rounded-lg pl-11 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="1234567890"
                      required={activeTab === 'withdrawal'}
                    />
                  </div>
                </div>

                {/* Warning */}
                {activeTab === 'withdrawal' && (
                  <div className="flex items-start p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-yellow-500 mr-3 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-yellow-500">
                      Los retiros son procesados en 1-3 días hábiles. Asegúrate de que la información bancaria sea correcta.
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <Button
  onClick={activeTab === 'deposit' ? handleDeposit : handleWithdrawal}
  disabled={loading || !amount || !bankName || (activeTab === 'withdrawal' && !accountNumber)}
  className="w-full py-4 text-lg flex items-center justify-center gap-2"
>
  {loading && (
    <svg
      className="animate-spin h-5 w-5 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l3 3-3 3v-4a8 8 0 01-8-8z"
      ></path>
    </svg>
  )}
  {activeTab === 'deposit' ? 'Depositar' : 'Retirar'} Fondos
</Button>

              </div>
            )}

            {/* History */}
            {activeTab === 'history' && (
              <div className="space-y-4">
                {transactions.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <History className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No hay transacciones aún</p>
                  </div>
                ) : (
                  transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          tx.transaction_type === 'deposit' || tx.transaction_type === 'referral_bonus'
                            ? 'bg-success-DEFAULT/10'
                            : 'bg-danger-DEFAULT/10'
                        }`}>
                          {tx.transaction_type === 'deposit' || tx.transaction_type === 'referral_bonus' ? (
                            <ArrowDownLeft className="w-6 h-6 text-success-DEFAULT" />
                          ) : (
                            <ArrowUpRight className="w-6 h-6 text-danger-DEFAULT" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-white">
                            {tx.transaction_type === 'deposit' && 'Depósito'}
                            {tx.transaction_type === 'withdrawal' && 'Retiro'}
                            {tx.transaction_type === 'referral_bonus' && 'Bono por Referido'}
                            {tx.transaction_type === 'commission' && 'Comisión'}
                          </p>
                          <p className="text-sm text-gray-400">
                            {tx.bank_name} • {formatDateTime(tx.created_at)}
                          </p>
                          {tx.transfer_reference && (
                            <p className="text-xs text-gray-500">Ref: {tx.transfer_reference}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${
                          tx.transaction_type === 'deposit' || tx.transaction_type === 'referral_bonus'
                            ? 'text-success-DEFAULT'
                            : 'text-danger-DEFAULT'
                        }`}>
                          {tx.transaction_type === 'deposit' || tx.transaction_type === 'referral_bonus' ? '+' : '-'}
                          {formatCurrency(tx.amount)}
                        </p>
                        <p className="text-sm text-gray-400">
                          Comisión: {formatCurrency(tx.fee)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary */}
        <div className="space-y-6">
          {(activeTab === 'deposit' || activeTab === 'withdrawal') && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Resumen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Monto</span>
                    <span className="text-white font-semibold">{formatCurrency(parseFloat(amount) || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">
                      Comisión ({activeTab === 'deposit' ? '1.5%' : '2%'})
                    </span>
                    <span className="text-white font-semibold">{formatCurrency(calculateFee())}</span>
                  </div>
                  <div className="pt-4 border-t border-gray-700">
                    <div className="flex justify-between">
                      <span className="font-semibold text-white">
                        {activeTab === 'deposit' ? 'Recibirás' : 'Total a Debitar'}
                      </span>
                      <span className={`text-xl font-bold ${
                        activeTab === 'deposit' ? 'text-success-DEFAULT' : 'text-danger-DEFAULT'
                      }`}>
                        {formatCurrency(activeTab === 'deposit' ? getNetAmount() : (parseFloat(amount) || 0) + calculateFee())}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-primary-500/10 border-primary-500/20">
                <CardContent className="pt-6">
                  <h4 className="font-semibold text-primary-400 mb-3">Información</h4>
                  <ul className="space-y-2 text-sm text-primary-200">
                    <li>• Depósito mínimo: $10.00</li>
                    <li>• Comisión de depósito: 1.5%</li>
                    <li>• Comisión de retiro: 2%</li>
                    <li>• Retiros procesados en 1-3 días</li>
                  </ul>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}