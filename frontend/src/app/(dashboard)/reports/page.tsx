'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader } from '@/components/ui/card2';
import { Button } from '@/components/ui/button2';
import { FileText, Download, Calendar, Filter } from 'lucide-react';

type ReportType = 'transactions' | 'portfolio' | 'tax' | 'performance';
type TimeRange = '1m' | '3m' | '6m' | '1y' | 'all';

export default function ReportsPage() {
  const { user } = useAuth();
  const [selectedReport, setSelectedReport] = useState<ReportType>('transactions');
  const [timeRange, setTimeRange] = useState<TimeRange>('1m');
  const [isGenerating, setIsGenerating] = useState(false);

  const reportTypes = [
    { id: 'transactions', label: 'Transacciones', icon: FileText },
    { id: 'portfolio', label: 'Portafolio', icon: FileText },
    { id: 'tax', label: 'Declaración Fiscal', icon: FileText },
    { id: 'performance', label: 'Rendimiento', icon: FileText },
  ];

  const timeRanges = [
    { id: '1m', label: 'Último mes' },
    { id: '3m', label: 'Últimos 3 meses' },
    { id: '6m', label: 'Últimos 6 meses' },
    { id: '1y', label: 'Último año' },
    { id: 'all', label: 'Todo el tiempo' },
  ];

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      // CONECTA CON: POST /api/reports/generate
      // await api.post('/reports/generate', { type: selectedReport, range: timeRange });
      
      // Simular generación
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Aquí descargarías el reporte
      console.log(`Generando reporte ${selectedReport} para ${timeRange}`);
    } catch (error) {
      console.error('Error generando reporte:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Reportes</h1>
        <p className="text-gray-400">Genera y descarga reportes de tu actividad</p>
      </div>

      {/* Report Generator */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <h2 className="text-xl font-semibold text-white">Generar Reporte</h2>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Report Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Tipo de Reporte
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {reportTypes.map((report) => {
                const Icon = report.icon;
                const isSelected = selectedReport === report.id;
                
                return (
                  <button
                    key={report.id}
                    onClick={() => setSelectedReport(report.id as ReportType)}
                    className={`
                      p-4 rounded-lg border transition-all
                      ${isSelected 
                        ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400' 
                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                      }
                    `}
                  >
                    <Icon className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm font-medium">{report.label}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Range Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Período
            </label>
            <div className="flex flex-wrap gap-2">
              {timeRanges.map((range) => {
                const isSelected = timeRange === range.id;
                
                return (
                  <button
                    key={range.id}
                    onClick={() => setTimeRange(range.id as TimeRange)}
                    className={`
                      px-4 py-2 rounded-lg text-sm font-medium transition-all
                      ${isSelected 
                        ? 'bg-cyan-500 text-white' 
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }
                    `}
                  >
                    {range.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Generate Button */}
          <div className="pt-4">
            <Button
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="w-full md:w-auto bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Generando...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Generar y Descargar
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <h2 className="text-xl font-semibold text-white">Reportes Recientes</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: 'Transacciones - Último mes', date: '2024-10-15', size: '245 KB' },
              { name: 'Portafolio - Q3 2024', date: '2024-09-30', size: '189 KB' },
              { name: 'Rendimiento - Último año', date: '2024-08-15', size: '312 KB' },
            ].map((report, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-cyan-400" />
                  <div>
                    <p className="font-medium text-white">{report.name}</p>
                    <p className="text-sm text-gray-400">
                      {report.date} • {report.size}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/10"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}