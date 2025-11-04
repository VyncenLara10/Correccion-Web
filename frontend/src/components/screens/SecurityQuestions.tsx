import { useState } from 'react';
import { ArrowLeft, Shield, AlertCircle, Check } from 'lucide-react';
import { Logo } from '../common/Logo';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';

interface SecurityQuestionsProps {
  onNavigate: (route: string) => void;
  onComplete: () => void;
}

const securityQuestions = [
  '¿Cuál es el nombre de tu primera mascota?',
  '¿En qué ciudad naciste?',
  '¿Cuál es tu comida favorita?',
  '¿Cuál es el nombre de tu mejor amigo de la infancia?',
  '¿Cuál era el modelo de tu primer auto?',
  '¿En qué escuela estudiaste primaria?',
  '¿Cuál es el segundo nombre de tu madre?',
  '¿Cuál es tu libro favorito?',
];

export function SecurityQuestions({ onNavigate, onComplete }: SecurityQuestionsProps) {
  const [question1, setQuestion1] = useState('');
  const [answer1, setAnswer1] = useState('');
  const [question2, setQuestion2] = useState('');
  const [answer2, setAnswer2] = useState('');
  const [question3, setQuestion3] = useState('');
  const [answer3, setAnswer3] = useState('');
  const [errors, setErrors] = useState<{
    question1?: string;
    answer1?: string;
    question2?: string;
    answer2?: string;
    question3?: string;
    answer3?: string;
    general?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!question1) {
      newErrors.question1 = 'Selecciona una pregunta';
    }
    if (!answer1 || answer1.trim().length < 3) {
      newErrors.answer1 = 'La respuesta debe tener al menos 3 caracteres';
    }

    if (!question2) {
      newErrors.question2 = 'Selecciona una pregunta';
    } else if (question2 === question1) {
      newErrors.question2 = 'Debes seleccionar preguntas diferentes';
    }
    if (!answer2 || answer2.trim().length < 3) {
      newErrors.answer2 = 'La respuesta debe tener al menos 3 caracteres';
    }

    if (!question3) {
      newErrors.question3 = 'Selecciona una pregunta';
    } else if (question3 === question1 || question3 === question2) {
      newErrors.question3 = 'Debes seleccionar preguntas diferentes';
    }
    if (!answer3 || answer3.trim().length < 3) {
      newErrors.answer3 = 'La respuesta debe tener al menos 3 caracteres';
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

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onComplete();
    }, 1500);
  };

  const availableQuestions1 = securityQuestions;
  const availableQuestions2 = securityQuestions.filter(q => q !== question1);
  const availableQuestions3 = securityQuestions.filter(q => q !== question1 && q !== question2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <Logo variant="light" size="lg" />
          </div>
          <p className="text-white/90">Configura tu seguridad adicional</p>
        </div>

        <Card className="border-0 shadow-2xl">
          <CardHeader>
            <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center mx-auto mb-4">
              <Shield className="h-6 w-6 text-brand-primary" />
            </div>
            <CardTitle className="text-center">Preguntas de Seguridad</CardTitle>
            <CardDescription className="text-center">
              Configura 3 preguntas de seguridad para recuperar tu cuenta en caso necesario
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Estas preguntas te ayudarán a recuperar tu cuenta si olvidas tu contraseña. 
                  Asegúrate de recordar las respuestas.
                </AlertDescription>
              </Alert>

              {errors.general && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.general}</AlertDescription>
                </Alert>
              )}

              {/* Question 1 */}
              <div className="space-y-4 p-4 border border-neutral-200 rounded-lg bg-neutral-50">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-brand-primary text-white flex items-center justify-center text-sm">
                    1
                  </div>
                  <h3 className="text-neutral-900">Primera Pregunta</h3>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="question1">Selecciona una pregunta</Label>
                  <Select value={question1} onValueChange={(value) => {
                    setQuestion1(value);
                    if (errors.question1) {
                      const { question1: _, ...rest } = errors;
                      setErrors(rest);
                    }
                  }}>
                    <SelectTrigger className={`bg-white ${errors.question1 ? 'border-danger' : ''}`}>
                      <SelectValue placeholder="Selecciona una pregunta..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableQuestions1.map((q, i) => (
                        <SelectItem key={i} value={q}>{q}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.question1 && (
                    <p className="text-sm text-danger flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.question1}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="answer1">Tu respuesta</Label>
                  <Input
                    id="answer1"
                    type="text"
                    placeholder="Ingresa tu respuesta..."
                    value={answer1}
                    onChange={(e) => {
                      setAnswer1(e.target.value);
                      if (errors.answer1) {
                        const { answer1: _, ...rest } = errors;
                        setErrors(rest);
                      }
                    }}
                    className={`bg-white ${errors.answer1 ? 'border-danger' : ''}`}
                  />
                  {errors.answer1 && (
                    <p className="text-sm text-danger flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.answer1}
                    </p>
                  )}
                  {answer1 && answer1.length >= 3 && !errors.answer1 && (
                    <p className="text-sm text-success flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      Respuesta válida
                    </p>
                  )}
                </div>
              </div>

              {/* Question 2 */}
              <div className="space-y-4 p-4 border border-neutral-200 rounded-lg bg-neutral-50">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-brand-primary text-white flex items-center justify-center text-sm">
                    2
                  </div>
                  <h3 className="text-neutral-900">Segunda Pregunta</h3>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="question2">Selecciona una pregunta</Label>
                  <Select value={question2} onValueChange={(value) => {
                    setQuestion2(value);
                    if (errors.question2) {
                      const { question2: _, ...rest } = errors;
                      setErrors(rest);
                    }
                  }}>
                    <SelectTrigger className={`bg-white ${errors.question2 ? 'border-danger' : ''}`}>
                      <SelectValue placeholder="Selecciona una pregunta..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableQuestions2.map((q, i) => (
                        <SelectItem key={i} value={q}>{q}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.question2 && (
                    <p className="text-sm text-danger flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.question2}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="answer2">Tu respuesta</Label>
                  <Input
                    id="answer2"
                    type="text"
                    placeholder="Ingresa tu respuesta..."
                    value={answer2}
                    onChange={(e) => {
                      setAnswer2(e.target.value);
                      if (errors.answer2) {
                        const { answer2: _, ...rest } = errors;
                        setErrors(rest);
                      }
                    }}
                    className={`bg-white ${errors.answer2 ? 'border-danger' : ''}`}
                  />
                  {errors.answer2 && (
                    <p className="text-sm text-danger flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.answer2}
                    </p>
                  )}
                  {answer2 && answer2.length >= 3 && !errors.answer2 && (
                    <p className="text-sm text-success flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      Respuesta válida
                    </p>
                  )}
                </div>
              </div>

              {/* Question 3 */}
              <div className="space-y-4 p-4 border border-neutral-200 rounded-lg bg-neutral-50">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-brand-primary text-white flex items-center justify-center text-sm">
                    3
                  </div>
                  <h3 className="text-neutral-900">Tercera Pregunta</h3>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="question3">Selecciona una pregunta</Label>
                  <Select value={question3} onValueChange={(value) => {
                    setQuestion3(value);
                    if (errors.question3) {
                      const { question3: _, ...rest } = errors;
                      setErrors(rest);
                    }
                  }}>
                    <SelectTrigger className={`bg-white ${errors.question3 ? 'border-danger' : ''}`}>
                      <SelectValue placeholder="Selecciona una pregunta..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableQuestions3.map((q, i) => (
                        <SelectItem key={i} value={q}>{q}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.question3 && (
                    <p className="text-sm text-danger flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.question3}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="answer3">Tu respuesta</Label>
                  <Input
                    id="answer3"
                    type="text"
                    placeholder="Ingresa tu respuesta..."
                    value={answer3}
                    onChange={(e) => {
                      setAnswer3(e.target.value);
                      if (errors.answer3) {
                        const { answer3: _, ...rest } = errors;
                        setErrors(rest);
                      }
                    }}
                    className={`bg-white ${errors.answer3 ? 'border-danger' : ''}`}
                  />
                  {errors.answer3 && (
                    <p className="text-sm text-danger flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.answer3}
                    </p>
                  )}
                  {answer3 && answer3.length >= 3 && !errors.answer3 && (
                    <p className="text-sm text-success flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      Respuesta válida
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => onNavigate('login')}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-brand-primary hover:bg-brand-primary/90"
                  disabled={isLoading}
                >
                  {isLoading ? 'Guardando...' : 'Completar Registro'}
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
