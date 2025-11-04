import { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { ArrowLeft, Eye, EyeOff, AlertCircle, LogIn } from 'lucide-react';
import { Logo } from '../common/Logo';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';

interface LoginProps {
  onNavigate: (route: string) => void;
  onLogin: (email: string, password: string) => void;
}

export function Login({ onNavigate, onLogin }: LoginProps) {
  const { loginWithRedirect, isAuthenticated, user } = useAuth0();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Ingresa un correo electrónico válido';
    }

    if (!password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      
      const response = await fetch(`${API_BASE_URL}users/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      console.log(response);

      const data = await response.json();

      if (data.success) {
        // Transformar datos del usuario para que tenga el nombre completo 
        const userFromBackend = data.user;
        const userData = {
          ...userFromBackend,
          name: `${userFromBackend.first_name || ''} ${userFromBackend.last_name || ''}`.trim(),
          role: userFromBackend.role || 'user'
        };
        
        // Guardar tokens y datos del usuario transformados
        localStorage.setItem('access_token', data.tokens.access);
        localStorage.setItem('refresh_token', data.tokens.refresh);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Llamar callback para actualizar estado
        onLogin(email, password);
      } else {
        setErrors({ general: data.message || 'Credenciales inválidas' });
      }
    } catch (err) {
      setErrors({ general: 'Error de conexión con el servidor' });
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuth0Login = async () => {
    try {
      setIsLoading(true);
      await loginWithRedirect({
        appState: { returnTo: window.location.origin + '/dashboard' },
      });
    } catch (error) {
      setErrors({ general: 'Error al iniciar sesión con Auth0. Intenta de nuevo.' });
      setIsLoading(false);
    }
  };

  const handleEmailBlur = () => {
    if (email && !validateEmail(email)) {
      setErrors({ ...errors, email: 'Ingresa un correo electrónico válido' });
    } else {
      const { email: _, ...rest } = errors;
      setErrors(rest);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <Logo variant="light" size="lg" />
          </div>
          <p className="text-white/90">Accede a tu cuenta de inversión</p>
        </div>

        <Card className="border-0 shadow-2xl">
          <CardHeader>
            <CardTitle>Iniciar Sesión</CardTitle>
            <CardDescription>
              Ingresa tus credenciales para acceder a tu cuenta
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
                  onBlur={handleEmailBlur}
                  className={`bg-input-background ${errors.email ? 'border-danger focus-visible:ring-danger' : ''}`}
                />
                {errors.email && (
                  <p className="text-sm text-danger flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Contraseña</Label>
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 h-auto text-sm text-brand-primary hover:text-brand-primary/90"
                    onClick={() => onNavigate('forgot-password')}
                  >
                    ¿Olvidaste tu contraseña?
                  </Button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) {
                        const { password: _, ...rest } = errors;
                        setErrors(rest);
                      }
                    }}
                    className={`bg-input-background pr-10 ${errors.password ? 'border-danger focus-visible:ring-danger' : ''}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-danger flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.password}
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full bg-brand-primary hover:bg-brand-primary/90"
                disabled={isLoading}
              >
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>

              <div className="text-center text-sm">
                <span className="text-muted-foreground">¿No tienes cuenta? </span>
                <Button
                  type="button"
                  variant="link"
                  className="p-0 h-auto text-brand-primary hover:text-brand-primary/90"
                  onClick={() => onNavigate('register')}
                >
                  Regístrate aquí
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
