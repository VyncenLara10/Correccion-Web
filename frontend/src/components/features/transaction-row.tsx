'use client';

import { ArrowUpRight, ArrowDownRight, Download, Upload } from 'lucide-react';
import { Badge } from '@/components/ui/bagde';
import type { Transaction } from '@/types';

interface TransactionRowProps {
  transaction: Transaction;
}

export function TransactionRow({ transaction }: TransactionRowProps) {
  const getIcon = () => {
    switch (transaction.type) {
      case 'buy':
        return <ArrowDownRight className="w-5 h-5 text-green-400" />;
      case 'sell':
        return <ArrowUpRight className="w-5 h-5 text-red-400" />;
      case 'deposit':
        return <Download className="w-5 h-5 text-cyan-400" />;
      case 'withdrawal':
        return <Upload className="w-5 h-5 text-purple-400" />;
      default:
        return null;
    }
  };

  const getTypeLabel = () => {
    switch (transaction.type) {
      case 'buy':
        return 'Compra';
      case 'sell':
        return 'Venta';
      case 'deposit':
        return 'Depósito';
      case 'withdrawal':
        return 'Retiro';
      default:
        return transaction.type;
    }
  };

  const getStatusColor = () => {
    switch (transaction.status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getStatusLabel = () => {
    switch (transaction.status) {
      case 'completed':
        return 'Completada';
      case 'pending':
        return 'Pendiente';
      case 'failed':
        return 'Fallida';
      default:
        return transaction.status;
    }
  };

  return (
    <tr className="border-b border-white/10 hover:bg-white/5 transition-colors">
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
            {getIcon()}
          </div>
          <div>
            <p className="text-white font-medium">{getTypeLabel()}</p>
            {transaction.stock_symbol && (
              <p className="text-gray-400 text-sm">{transaction.stock_symbol}</p>
            )}
          </div>
        </div>
      </td>

      {transaction.quantity && (
        <td className="py-4 px-4 text-white">
          {transaction.quantity} acciones
        </td>
      )}

      {transaction.price && (
        <td className="py-4 px-4 text-white">
          ${transaction.price.toFixed(2)}
        </td>
      )}

      <td className="py-4 px-4">
        <span className={`font-bold ${
          transaction.type === 'buy' || transaction.type === 'withdrawal' 
            ? 'text-red-400' 
            : 'text-green-400'
        }`}>
          {transaction.type === 'buy' || transaction.type === 'withdrawal' ? '-' : '+'}
          ${transaction.total.toFixed(2)}
        </span>
      </td>

      <td className="py-4 px-4">
        <Badge className={getStatusColor()}>
          {getStatusLabel()}
        </Badge>
      </td>

      <td className="py-4 px-4 text-gray-400 text-sm">
        {new Date(transaction.created_at).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </td>
    </tr>
  );
}