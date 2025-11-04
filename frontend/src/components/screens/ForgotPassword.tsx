import { useState } from 'react';
import { ArrowLeft, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { Logo } from '../common/Logo';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';

interface ForgotPasswordProps {
  onNavigate: (route: string) => void;
}

export function ForgotPassword({ onNavigate }: ForgotPasswordProps) {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ email?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!email) {
      setErrors({ email: 'El correo electrónico es requerido' });
      return;
    }

    if (!validateEmail(email)) {
      setErrors({ email: 'Ingresa un correo electrónico válido' });
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setEmailSent(true);
      setIsLoading(false);
    }, 1500);
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="flex justify-center mb-4">
              <Logo variant="light" size="lg" />
            </div>
          </div>

          <Card className="border-0 shadow-2xl">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-success-light flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <CardTitle className="text-center">Correo Enviado</CardTitle>
              <CardDescription className="text-center">
                Revisa tu bandeja de entrada
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  Hemos enviado un enlace de recuperación a <strong>{email}</strong>. 
                  El enlace expirará en 1 hora.
                </AlertDescription>
              </Alert>

              <div className="space-y-3 text-sm text-muted-foreground">
                <p>Si no recibes el correo en unos minutos:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Revisa tu carpeta de spam</li>
                  <li>Verifica que el correo sea correcto</li>
                  <li>Intenta solicitar un nuevo enlace</li>
                </ul>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setEmailSent(false);
                  setEmail('');
                }}
              >
                Enviar a otro correo
              </Button>

              <Button
                variant="ghost"
                className="w-full"
                onClick={() => onNavigate('login')}
              >
                Volver a inicio de sesión
              </Button>
            </CardContent>
          </Card>

          <div className="mt-4 text-center">
            <Button
              variant="ghost"
              className="text-white hover:text-white/90 hover:bg-white/10"
              onClick={() => onNavigate('landing')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al inicio
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <Logo variant="light" size="lg" />
          </div>
          <p className="text-white/90">Recupera el acceso a tu cuenta</p>
        </div>

        <Card className="border-0 shadow-2xl">
          <CardHeader>
            <CardTitle>¿Olvidaste tu contraseña?</CardTitle>
            <CardDescription>
              Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.general && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.general}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@correo.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) {
                        const { email: _, ...rest } = errors;
                        setErrors(rest);
                      }
                    }}
                    className={`bg-input-background pl-10 ${errors.email ? 'border-danger focus-visible:ring-danger' : ''}`}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-danger flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.email}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-brand-primary hover:bg-brand-primary/90"
                disabled={isLoading}
              >
                {isLoading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
              </Button>

              <div className="text-center text-sm">
                <span className="text-muted-foreground">¿Recordaste tu contraseña? </span>
                <Button
                  type="button"
                  variant="link"
                  className="p-0 h-auto text-brand-primary hover:text-brand-primary/90"
                  onClick={() => onNavigate('login')}
                >
                  Inicia sesión
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-4 text-center">
          <Button
            variant="ghost"
            className="text-white hover:text-white/90 hover:bg-white/10"
            onClick={() => onNavigate('landing')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al inicio
          </Button>
        </div>
      </div>
    </div>
  );
}
