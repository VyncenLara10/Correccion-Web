import { useState } from 'react';
import { ArrowLeft, FileText, Mail, Download, Calendar, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { Alert, AlertDescription } from '../ui/alert';
import { toast } from 'sonner@2.0.3';

interface RequestReportProps {
  onNavigate: (route: string) => void;
}

export function RequestReport({ onNavigate }: RequestReportProps) {
  const [reportTypes, setReportTypes] = useState<string[]>(['complete']);
  const [reportDateFrom, setReportDateFrom] = useState('');
  const [reportDateTo, setReportDateTo] = useState('');
  const [reportEmail, setReportEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    dateFrom?: string;
    dateTo?: string;
    email?: string;
  }>({});

  const availableReportTypes = [
    {
      value: 'complete',
      label: 'Reporte Completo',
      description: 'Incluye toda tu información: perfil, portafolio, transacciones y rendimiento',
      icon: FileText,
    },
    {
      value: 'profile',
      label: 'Perfil',
      description: 'Tu información personal y datos de cuenta',
      icon: FileText,
    },
    {
      value: 'portfolio',
      label: 'Portafolio',
      description: 'Estado actual de tus inversiones y distribución de activos',
      icon: FileText,
    },
    {
      value: 'transactions',
      label: 'Transacciones',
      description: 'Historial detallado de todas tus operaciones de compra y venta',
      icon: Calendar,
    },
    {
      value: 'performance',
      label: 'Rendimiento',
      description: 'Análisis de ganancias, pérdidas y rendimiento histórico',
      icon: CheckCircle,
    },
  ];

  const toggleReportType = (type: string) => {
    if (type === 'complete') {
      setReportTypes(['complete']);
    } else {
      const newTypes = reportTypes.filter(t => t !== 'complete');
      if (newTypes.includes(type)) {
        setReportTypes(newTypes.filter(t => t !== type));
      } else {
        setReportTypes([...newTypes, type]);
      }
    }
  };

  const selectedReportDisplay = reportTypes.length === 1 && reportTypes[0] === 'complete' 
    ? availableReportTypes[0]
    : availableReportTypes.find(t => t.value === reportTypes[0]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!reportDateFrom) {
      newErrors.dateFrom = 'Selecciona la fecha inicial';
    }

    if (!reportDateTo) {
      newErrors.dateTo = 'Selecciona la fecha final';
    }

    if (reportDateFrom && reportDateTo && new Date(reportDateFrom) > new Date(reportDateTo)) {
      newErrors.dateTo = 'La fecha final debe ser posterior a la fecha inicial';
    }

    if (!reportEmail) {
      newErrors.email = 'Ingresa un correo electrónico';
    } else if (!validateEmail(reportEmail)) {
      newErrors.email = 'Ingresa un correo electrónico válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const token = localStorage.getItem('access_token');

      if (!token) {
        toast.error('Error: No autenticado');
        onNavigate('login');
        setIsSubmitting(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/reports/request_report/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          report_types: reportTypes,
          start_date: reportDateFrom,
          end_date: reportDateTo,
          recipient_email: reportEmail,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('¡Reporte generado!', {
          description: `Se envió tu reporte a ${reportEmail}. Revisa tu correo en unos momentos.`,
        });
        
        setTimeout(() => {
          onNavigate('dashboard');
        }, 2000);
      } else {
        toast.error('Error', {
          description: data.message || 'Error al solicitar el reporte',
        });
      }
    } catch (error) {
      toast.error('Error', {
        description: 'Error de conexión',
      });
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => onNavigate('dashboard')}
            className="mb-4 -ml-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Dashboard
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center">
              <FileText className="h-6 w-6 text-brand-primary" />
            </div>
            <div>
              <h1 className="text-3xl text-neutral-900">Solicitar Reporte</h1>
              <p className="text-neutral-600">
                Genera y recibe reportes detallados de tu actividad
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <Card className="lg:col-span-2 border-border">
            <CardHeader>
              <CardTitle>Configuración del Reporte</CardTitle>
              <CardDescription>
                Selecciona el tipo de reporte y el período que deseas consultar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Report Type Selection */}
                <div className="space-y-3">
                  <Label>Tipo de Reporte</Label>
                  <div className="space-y-2">
                    {availableReportTypes.map((type) => (
                      <div key={type.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={type.value}
                          checked={reportTypes.includes(type.value)}
                          onCheckedChange={() => toggleReportType(type.value)}
                          disabled={type.value !== 'complete' && reportTypes.includes('complete')}
                        />
                        <Label 
                          htmlFor={type.value} 
                          className="flex items-center gap-2 cursor-pointer font-normal"
                        >
                          <type.icon className="h-4 w-4" />
                          <span>{type.label}</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                  {reportTypes.length > 0 && (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        {reportTypes.includes('complete') 
                          ? 'Se incluirán todas las secciones en el reporte'
                          : `Se incluirán ${reportTypes.length} sección(es): ${reportTypes.join(', ')}`
                        }
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                {/* Date Range */}
                <div className="space-y-3">
                  <Label>Período del Reporte</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dateFrom" className="text-sm text-muted-foreground">
                        Fecha Inicial
                      </Label>
                      <Input
                        id="dateFrom"
                        type="date"
                        value={reportDateFrom}
                        onChange={(e) => {
                          setReportDateFrom(e.target.value);
                          if (errors.dateFrom) {
                            const { dateFrom, ...rest } = errors;
                            setErrors(rest);
                          }
                        }}
                        className={errors.dateFrom ? 'border-danger' : ''}
                      />
                      {errors.dateFrom && (
                        <p className="text-sm text-danger flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.dateFrom}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateTo" className="text-sm text-muted-foreground">
                        Fecha Final
                      </Label>
                      <Input
                        id="dateTo"
                        type="date"
                        value={reportDateTo}
                        onChange={(e) => {
                          setReportDateTo(e.target.value);
                          if (errors.dateTo) {
                            const { dateTo, ...rest } = errors;
                            setErrors(rest);
                          }
                        }}
                        className={errors.dateTo ? 'border-danger' : ''}
                      />
                      {errors.dateTo && (
                        <p className="text-sm text-danger flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.dateTo}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico de Entrega</Label>
                  <Input
                    id="email"
                    type="email"
                    value={reportEmail}
                    onChange={(e) => {
                      setReportEmail(e.target.value);
                      if (errors.email) {
                        const { email, ...rest } = errors;
                        setErrors(rest);
                      }
                    }}
                    placeholder="tu@correo.com"
                    className={errors.email ? 'border-danger' : ''}
                  />
                  {errors.email && (
                    <p className="text-sm text-danger flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.email}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    El reporte se enviará a este correo en formato PDF
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onNavigate('dashboard')}
                    className="sm:flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="sm:flex-1 bg-brand-primary hover:bg-brand-primary/90"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Download className="mr-2 h-4 w-4 animate-pulse" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Solicitar Reporte
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Info Sidebar */}
          <div className="space-y-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-base">Información</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-4 w-4 text-brand-primary" />
                    </div>
                    <div>
                      <p className="text-neutral-900 mb-1">Formato PDF</p>
                      <p className="text-muted-foreground text-xs">
                        El reporte será generado en formato PDF para fácil lectura e impresión
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="h-4 w-4 text-success" />
                    </div>
                    <div>
                      <p className="text-neutral-900 mb-1">Entrega Rápida</p>
                      <p className="text-muted-foreground text-xs">
                        Recibirás el reporte en tu correo en menos de 5 minutos
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-info/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-4 w-4 text-info" />
                    </div>
                    <div>
                      <p className="text-neutral-900 mb-1">Datos Actualizados</p>
                      <p className="text-muted-foreground text-xs">
                        La información incluida es en tiempo real al momento de la generación
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-brand-primary/5">
              <CardContent className="pt-6">
                <div className="space-y-2 text-sm">
                  <p className="text-neutral-900">💡 Consejo</p>
                  <p className="text-muted-foreground text-xs">
                    Para un análisis completo de tu rendimiento, te recomendamos solicitar el 
                    Reporte Completo con un período de al menos 30 días.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
