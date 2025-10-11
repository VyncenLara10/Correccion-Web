'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { formatDateTime } from '@/lib/utils';
import { FileText, Download, Calendar, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [reportType, setReportType] = useState('transaction_history');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const data = await api.getReports();
      setReports(data.results || data);
    } catch (error) {
      console.error('Error loading reports:', error);
    }
  };

  const requestReport = async () => {
    if (!startDate || !endDate) {
      toast.error('Selecciona un rango de fechas');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error('La fecha de inicio debe ser anterior a la fecha de fin');
      return;
    }

    setIsLoading(true);
    try {
      await api.requestReport({
        report_type: reportType,
        start_date: startDate,
        end_date: endDate,
      });

      toast.success('Reporte solicitado exitosamente', {
        description: 'Recibirás un email cuando esté listo',
      });

      setStartDate('');
      setEndDate('');
      await loadReports();
    } catch (error) {
      toast.error('Error al solicitar el reporte');
    } finally {
      setIsLoading(false);
    }
  };

  const reportTypes = [
    {
      value: 'transaction_history',
      label: 'Historial de Transacciones',
      description: 'Detalle completo de todas tus compras y ventas',
      icon: FileText,
    },
    {
      value: 'profit_loss',
      label: 'Ganancias y Pérdidas',
      description: 'Análisis de rendimiento por acción',
      icon: FileText,
    },
    {
      value: 'portfolio_summary',
      label: 'Resumen de Portafolio',
      description: 'Estado actual de tus inversiones',
      icon: FileText,
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-success-DEFAULT" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-yellow-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-danger-DEFAULT" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completado';
      case 'processing':
        return 'Procesando';
      case 'failed':
        return 'Fallido';
      default:
        return 'Pendiente';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Reportes</h1>
        <p className="text-gray-400">Solicita reportes detallados de tus inversiones</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Request Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Solicitar Nuevo Reporte</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Report Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Tipo de Reporte
              </label>
              <div className="space-y-3">
                {reportTypes.map((type) => (
                  <label
                    key={type.value}
                    className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition ${
                      reportType === type.value
                        ? 'border-primary-500 bg-primary-500/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reportType"
                      value={type.value}
                      checked={reportType === type.value}
                      onChange={(e) => setReportType(e.target.value)}
                      className="mt-1"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center">
                        <type.icon className="w-5 h-5 mr-2 text-primary-500" />
                        <span className="font-semibold text-white">{type.label}</span>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">{type.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Fecha Inicio
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-gray-900/50 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Fecha Fin
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-gray-900/50 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="flex items-start p-4 bg-primary-500/10 border border-primary-500/20 rounded-lg">
              <FileText className="w-5 h-5 text-primary-500 mr-3 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-primary-200">
                <p className="font-semibold mb-1">Información</p>
                <ul className="space-y-1">
                  <li>• Los reportes son generados en formato CSV</li>
                  <li>• Recibirás un email cuando el reporte esté listo</li>
                  <li>• El proceso puede tardar algunos minutos</li>
                </ul>
              </div>
            </div>

            {/* Submit */}
            <Button
              onClick={requestReport}
              isLoading={isLoading}
              disabled={!startDate || !endDate}
              className="w-full py-3"
            >
              <Download className="w-5 h-5 mr-2" />
              Solicitar Reporte
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-4">
          <Card className="bg-gradient-to-br from-primary-500 to-primary-600">
            <CardContent className="pt-6">
              <FileText className="w-8 h-8 text-white mb-3" />
              <h3 className="text-lg font-bold text-white mb-1">Reportes Rápidos</h3>
              <p className="text-sm text-primary-100 mb-4">
                Genera reportes predefinidos al instante
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    const today = new Date();
                    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                    setStartDate(lastMonth.toISOString().split('T')[0]);
                    setEndDate(today.toISOString().split('T')[0]);
                  }}
                  className="w-full bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  Último Mes
                </button>
                <button
                  onClick={() => {
                    const today = new Date();
                    const lastQuarter = new Date(today.getFullYear(), today.getMonth() - 3, 1);
                    setStartDate(lastQuarter.toISOString().split('T')[0]);
                    setEndDate(today.toISOString().split('T')[0]);
                  }}
                  className="w-full bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  Último Trimestre
                </button>
                <button
                  onClick={() => {
                    const today = new Date();
                    const yearStart = new Date(today.getFullYear(), 0, 1);
                    setStartDate(yearStart.toISOString().split('T')[0]);
                    setEndDate(today.toISOString().split('T')[0]);
                  }}
                  className="w-full bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  Este Año
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reports History */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Reportes</CardTitle>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No has solicitado reportes aún</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700"
                >
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(report.status)}
                    <div>
                      <p className="font-semibold text-white">
                        {reportTypes.find(t => t.value === report.report_type)?.label}
                      </p>
                      <p className="text-sm text-gray-400">
                        {new Date(report.start_date).toLocaleDateString()} - {new Date(report.end_date).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        Solicitado: {formatDateTime(report.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`text-sm font-medium ${
                      report.status === 'completed' ? 'text-success-DEFAULT' :
                      report.status === 'processing' ? 'text-yellow-500' :
                      report.status === 'failed' ? 'text-danger-DEFAULT' : 'text-gray-400'
                    }`}>
                      {getStatusText(report.status)}
                    </span>
                    {report.status === 'completed' && report.file && (
                      <a
                        href={report.file}
                        download
                        className="flex items-center px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-sm font-medium transition"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Descargar
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}