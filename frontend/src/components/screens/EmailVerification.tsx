import { useState, useEffect } from 'react';
import { ArrowLeft, Mail, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { Logo } from '../common/Logo';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../ui/input-otp';
import { toast } from 'sonner@2.0.3';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface EmailVerificationProps {
  onNavigate: (route: string) => void;
  email?: string;
}

export function EmailVerification({ onNavigate, email: propEmail }: EmailVerificationProps) {
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState('');
  // Obtener email desde localStorage (guardado por Register)
  const [email, setEmail] = useState(propEmail || localStorage.getItem('registeredEmail') || 'usuario@ejemplo.com');

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  // Auto-verify when code is complete
  useEffect(() => {
    if (code.length === 6) {
      handleVerifyCode();
    }
  }, [code]);

  const handleVerifyCode = async () => {
    setIsVerifying(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/users/verify_code/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          code: code,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || data.message || 'Código incorrecto');
        setCode('');
        setIsVerifying(false);
        return;
      }

      // Código verificado exitosamente
      toast.success('¡Código verificado exitosamente!');
      // Guardar tokens si vienen en la respuesta
      if (data.access) {
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
      }
      setTimeout(() => {
        onNavigate('security-questions');
      }, 500);
    } catch (err) {
      setError('Error de conexión. Por favor intenta de nuevo.');
      setCode('');
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    setError('');
    setCode('');

    try {
      const response = await fetch(`${API_BASE_URL}/users/send_verification_code/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
        }),
      });

      if (!response.ok) {
        setError('Error al reenviar el código');
        setIsResending(false);
        return;
      }

      setIsResending(false);
      setCountdown(60);
      setCanResend(false);
      toast.success('Código reenviado a tu correo electrónico');
    } catch (err) {
      setError('Error de conexión. Por favor intenta de nuevo.');
      setIsResending(false);
    }
  };

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
            <div className="w-16 h-16 rounded-full bg-brand-primary/10 flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-brand-primary" />
            </div>
            <CardTitle className="text-center">Verifica tu Correo</CardTitle>
            <CardDescription className="text-center">
              Ingresa el código de 6 dígitos que enviamos a<br />
              <strong className="text-foreground">{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* OTP Input */}
            <div className="flex flex-col items-center space-y-4">
              <InputOTP
                maxLength={6}
                value={code}
                onChange={(value) => {
                  setCode(value);
                  setError('');
                }}
                disabled={isVerifying}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>

              {/* Helper text */}
              <p className="text-sm text-muted-foreground text-center">
                {isVerifying ? (
                  <span className="flex items-center gap-2 text-brand-primary">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Verificando código...
                  </span>
                ) : (
                  'Ingresa el código de 6 dígitos'
                )}
              </p>
            </div>

            {/* Error message */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Demo info - only shown for testing */}
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>Demo:</strong> Ingresa cualquier código de 6 dígitos o usa <strong>123456</strong>
              </AlertDescription>
            </Alert>

            {/* Resend code */}
            <div className="space-y-3">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-3">
                  ¿No recibiste el código?
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleResendCode}
                  disabled={!canResend || isResending}
                >
                  {isResending ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Reenviando código...
                    </>
                  ) : canResend ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Reenviar código
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Reenviar en {countdown}s
                    </>
                  )}
                </Button>
              </div>

              {/* Tips */}
              <div className="bg-neutral-50 rounded-lg p-4">
                <p className="text-sm text-neutral-600 mb-2">No encuentras el correo?</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Revisa tu carpeta de spam o correo no deseado</li>
                  <li>• Verifica que el correo electrónico sea correcto</li>
                  <li>• El código es válido por 10 minutos</li>
                </ul>
              </div>

              <Button
                variant="ghost"
                className="w-full"
                onClick={() => onNavigate('register')}
              >
                Cambiar correo electrónico
              </Button>
            </div>
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
