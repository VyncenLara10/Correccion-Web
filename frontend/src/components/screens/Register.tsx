import { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, AlertCircle, Check, X } from 'lucide-react';
import { Logo } from '../common/Logo';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { Alert, AlertDescription } from '../ui/alert';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface RegisterProps {
  onNavigate: (route: string) => void;
  onRegister: (data: { name: string; email: string; password: string }) => void;
}

export function Register({ onNavigate, onRegister }: RegisterProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    terms?: string;
    general?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // Password validation criteria
  const passwordValidations = {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const isPasswordValid = Object.values(passwordValidations).every(Boolean);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = 'El nombre es requerido';
    } else if (name.trim().length < 3) {
      newErrors.name = 'El nombre debe tener al menos 3 caracteres';
    }

    if (!email) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Ingresa un correo electrónico válido';
    }

    if (!password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (!isPasswordValid) {
      newErrors.password = 'La contraseña no cumple con los requisitos';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (!acceptedTerms) {
      newErrors.terms = 'Debes aceptar los términos y condiciones';
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
      const response = await fetch(`${API_BASE_URL}/users/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: name.split(' ')[0],
          last_name: name.split(' ').slice(1).join(' ') || 'Usuario',
          email: email,
          password: password,
          password2: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ general: data.detail || data.message || 'Error al registrar' });
        setIsLoading(false);
        return;
      }

      // Registro exitoso
      onRegister({ name, email, password });
      // Guardar el email en localStorage para usarlo en EmailVerification
      localStorage.setItem('registeredEmail', email);
      onNavigate('email-verification');
      setIsLoading(false);
    } catch (error) {
      setErrors({ general: 'Error de conexión. Por favor intenta de nuevo.' });
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

  const handleConfirmPasswordBlur = () => {
    if (confirmPassword && password !== confirmPassword) {
      setErrors({ ...errors, confirmPassword: 'Las contraseñas no coinciden' });
    } else {
      const { confirmPassword: _, ...rest } = errors;
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
          <p className="text-white/90">Crea tu cuenta y comienza a invertir</p>
        </div>

        <Card className="border-0 shadow-2xl">
          <CardHeader>
            <CardTitle>Crear Cuenta</CardTitle>
            <CardDescription>
              Completa el formulario para registrarte en TikalInvest
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

              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name">Nombre Completo</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Juan Pérez"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) {
                      const { name: _, ...rest } = errors;
                      setErrors(rest);
                    }
                  }}
                  className={`bg-input-background ${errors.name ? 'border-danger focus-visible:ring-danger' : ''}`}
                />
                {errors.name && (
                  <p className="text-sm text-danger flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email Field */}
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

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
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
                    onFocus={() => setPasswordFocused(true)}
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
                
                {/* Password Requirements */}
                {(passwordFocused || password) && (
                  <div className="bg-neutral-50 rounded-lg p-3 space-y-1 text-xs">
                    <p className="text-neutral-600 mb-2">La contraseña debe contener:</p>
                    <div className="space-y-1">
                      <PasswordRequirement met={passwordValidations.minLength} text="Mínimo 8 caracteres" />
                      <PasswordRequirement met={passwordValidations.hasUpperCase} text="Una letra mayúscula" />
                      <PasswordRequirement met={passwordValidations.hasLowerCase} text="Una letra minúscula" />
                      <PasswordRequirement met={passwordValidations.hasNumber} text="Un número" />
                      <PasswordRequirement met={passwordValidations.hasSpecialChar} text="Un carácter especial (!@#$%...)" />
                    </div>
                  </div>
                )}

                {errors.password && (
                  <p className="text-sm text-danger flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) {
                        const { confirmPassword: _, ...rest } = errors;
                        setErrors(rest);
                      }
                    }}
                    onBlur={handleConfirmPasswordBlur}
                    className={`bg-input-background pr-10 ${errors.confirmPassword ? 'border-danger focus-visible:ring-danger' : ''}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-danger flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.confirmPassword}
                  </p>
                )}
                {confirmPassword && password === confirmPassword && (
                  <p className="text-sm text-success flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    Las contraseñas coinciden
                  </p>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={acceptedTerms}
                    onCheckedChange={(checked) => {
                      setAcceptedTerms(checked as boolean);
                      if (checked) {
                        const { terms: _, ...rest } = errors;
                        setErrors(rest);
                      }
                    }}
                    className={errors.terms ? 'border-danger' : ''}
                  />
                  <label
                    htmlFor="terms"
                    className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Acepto los{' '}
                    <button
                      type="button"
                      className="text-brand-primary hover:underline"
                    >
                      términos y condiciones
                    </button>
                    {' '}y la{' '}
                    <button
                      type="button"
                      className="text-brand-primary hover:underline"
                    >
                      política de privacidad
                    </button>
                  </label>
                </div>
                {errors.terms && (
                  <p className="text-sm text-danger flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.terms}
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full bg-brand-primary hover:bg-brand-primary/90"
                disabled={isLoading}
              >
                {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
              </Button>

              <div className="text-center text-sm">
                <span className="text-muted-foreground">¿Ya tienes cuenta? </span>
                <Button
                  type="button"
                  variant="link"
                  className="p-0 h-auto text-brand-primary hover:text-brand-primary/90"
                  onClick={() => onNavigate('login')}
                >
                  Inicia sesión aquí
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

// Helper component for password requirements
function PasswordRequirement({ met, text }: { met: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2">
      {met ? (
        <Check className="h-3 w-3 text-success" />
      ) : (
        <X className="h-3 w-3 text-neutral-400" />
      )}
      <span className={met ? 'text-success' : 'text-neutral-500'}>{text}</span>
    </div>
  );
}
