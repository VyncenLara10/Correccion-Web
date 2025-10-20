'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card2';
import {Button} from '@/components/ui/button2';
import { formatCurrency, formatPercent, getChangeColor } from '@/lib/utils';
import { Briefcase, TrendingUp, TrendingDown, DollarSign, PieChart, ArrowRight } from 'lucide-react';
import {getPortfolio, getPortfolioSummary} from '@/lib/api';
import { toast } from 'sonner';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#0066FF', '#00C853', '#FF9500', '#FF3B30', '#AF52DE', '#5AC8FA'];

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPortfolio();
  }, []);

  const loadPortfolio = async () => {
    setIsLoading(true);
    try {
      const [portfolioData, summaryData] = await Promise.all([
        getPortfolio(),
        getPortfolioSummary(),
      ]);
      setPortfolio(portfolioData.results || portfolioData);
      setSummary(summaryData);
    } catch (error) {
      toast.error('Error al cargar el portafolio');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const chartData = portfolio.map((position) => ({
    name: position.stock.symbol,
    value: parseFloat(position.current_value),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Mi Portafolio</h1>
          <p className="text-gray-400">Resumen completo de tus inversiones</p>
        </div>
        <Link href="/dashboard/market">
          <Button>
            Explorar Mercado
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Valor Total</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(summary?.total_value || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-500/10 rounded-full flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-primary-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Invertido</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(summary?.total_invested || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-500/10 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-primary-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Ganancia/Pérdida</p>
                <p className={`text-2xl font-bold ${getChangeColor(summary?.total_profit_loss || 0)}`}>
                  {formatCurrency(summary?.total_profit_loss || 0)}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                (summary?.total_profit_loss || 0) >= 0 ? 'bg-success-DEFAULT/10' : 'bg-danger-DEFAULT/10'
              }`}>
                {(summary?.total_profit_loss || 0) >= 0 ? (
                  <TrendingUp className="w-6 h-6 text-success-DEFAULT" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-danger-DEFAULT" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Rendimiento</p>
                <p className={`text-2xl font-bold ${getChangeColor(summary?.profit_loss_percentage || 0)}`}>
                  {summary?.profit_loss_percentage >= 0 ? '+' : ''}
                  {summary?.profit_loss_percentage?.toFixed(2) || 0}%
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-500/10 rounded-full flex items-center justify-center">
                <PieChart className="w-6 h-6 text-primary-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {portfolio.length === 0 ? (
        <Card>
          <CardContent className="py-20 text-center">
            <Briefcase className="w-20 h-20 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Tu portafolio está vacío</h3>
            <p className="text-gray-400 mb-6">Comienza a invertir para ver tus posiciones aquí</p>
            <Link href="/dashboard/market">
              <Button>Explorar Acciones</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Distribución</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPie>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => entry.name}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => formatCurrency(value)} />
                </RechartsPie>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {portfolio.map((position, index) => (
                  <div key={position.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-gray-300">{position.stock.symbol}</span>
                    </div>
                    <span className="text-white font-semibold">
                      {((position.current_value / summary.total_value) * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Positions Table */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Posiciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-400 border-b border-gray-700">
                      <th className="pb-3">Acción</th>
                      <th className="pb-3 text-right">Cantidad</th>
                      <th className="pb-3 text-right">Precio Prom.</th>
                      <th className="pb-3 text-right">Precio Actual</th>
                      <th className="pb-3 text-right">Valor</th>
                      <th className="pb-3 text-right">Ganancia/Pérdida</th>
                      <th className="pb-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolio.map((position) => (
                      <tr key={position.id} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                        <td className="py-4">
                          <Link href={`/dashboard/market/${position.stock.symbol}`} className="hover:text-primary-500">
                            <div className="font-semibold text-white">{position.stock.symbol}</div>
                            <div className="text-sm text-gray-400">{position.stock.name}</div>
                          </Link>
                        </td>
                        <td className="py-4 text-right text-white">{position.quantity}</td>
                        <td className="py-4 text-right text-white">
                          {formatCurrency(position.average_buy_price)}
                        </td>
                        <td className="py-4 text-right text-white">
                          {formatCurrency(position.stock.current_price)}
                        </td>
                        <td className="py-4 text-right text-white font-semibold">
                          {formatCurrency(position.current_value)}
                        </td>
                        <td className="py-4 text-right">
                          <div className={`font-semibold ${getChangeColor(position.profit_loss)}`}>
                            {position.profit_loss >= 0 ? '+' : ''}{formatCurrency(position.profit_loss)}
                          </div>
                          <div className={`text-sm ${getChangeColor(position.profit_loss_percentage)}`}>
                            {position.profit_loss_percentage >= 0 ? '+' : ''}
                            {position.profit_loss_percentage?.toFixed(2)}%
                          </div>
                        </td>
                        <td className="py-4 text-right">
                          <Link href={`/dashboard/trade?stock=${position.stock.id}&type=sell`}>
                            <Button size="sm" variant="outline">
                              Vender
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}