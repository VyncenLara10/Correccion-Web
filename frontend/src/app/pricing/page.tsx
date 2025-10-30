'use client';

import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button2';
import { Card, CardContent, CardHeader } from '@/components/ui/card2';
import Link from 'next/link';

export default function PricingPage() {
  const plans = [
    {
      name: 'Básico',
      price: '0',
      description: 'Perfecto para comenzar tu viaje de inversión',
      features: [
        'Acceso al mercado de acciones',
        'Hasta $1,000 USD en inversiones',
        'Comisión del 2% por transacción',
        'Reportes mensuales',
        'Soporte por email',
        'Dashboard básico'
      ],
      highlighted: false,
      buttonText: 'Comenzar Gratis',
      buttonLink: '/register'
    },
    {
      name: 'Profesional',
      price: '29',
      description: 'Para inversores serios que buscan más',
      features: [
        'Todo lo del plan Básico',
        'Inversiones ilimitadas',
        'Comisión del 1% por transacción',
        'Reportes en tiempo real',
        'Soporte prioritario 24/7',
        'Dashboard avanzado con analytics',
        'Alertas de precio personalizadas',
        'Acceso a análisis de mercado'
      ],
      highlighted: true,
      buttonText: 'Probar 30 días gratis',
      buttonLink: '/register?plan=pro'
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'Soluciones personalizadas para instituciones',
      features: [
        'Todo lo del plan Profesional',
        'API dedicada',
        'Comisión personalizada',
        'Gestor de cuenta dedicado',
        'Trading automatizado',
        'Reportes personalizados',
        'Integración con sistemas propios',
        'SLA garantizado'
      ],
      highlighted: false,
      buttonText: 'Contactar Ventas',
      buttonLink: '/contact'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] to-[#1a1f3a]">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Planes y Precios
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Elige el plan perfecto para tus necesidades de inversión
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`relative ${
                  plan.highlighted
                    ? 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500/50 scale-105'
                    : 'bg-white/5 border-white/10'
                } hover:scale-105 transition-all duration-300`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Más Popular
                    </span>
                  </div>
                )}
                
                <CardHeader className="text-center pb-8 pt-10">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center gap-2">
                    {plan.price !== 'Custom' && (
                      <span className="text-4xl font-bold text-white">$</span>
                    )}
                    <span className="text-5xl font-bold text-white">{plan.price}</span>
                    {plan.price !== 'Custom' && (
                      <span className="text-gray-400">/mes</span>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link href={plan.buttonLink}>
                    <Button
                      className={`w-full ${
                        plan.highlighted
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600'
                          : 'bg-white/10 hover:bg-white/20'
                      }`}
                    >
                      {plan.buttonText}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="mt-20">
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              Preguntas Frecuentes
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    ¿Puedo cambiar de plan en cualquier momento?
                  </h3>
                  <p className="text-gray-300 text-sm">
                    Sí, puedes actualizar o degradar tu plan en cualquier momento desde tu dashboard.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    ¿Qué métodos de pago aceptan?
                  </h3>
                  <p className="text-gray-300 text-sm">
                    Aceptamos tarjetas de crédito, débito, transferencias bancarias y criptomonedas.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    ¿Hay período de prueba?
                  </h3>
                  <p className="text-gray-300 text-sm">
                    El plan Profesional incluye 30 días de prueba gratis. No se requiere tarjeta de crédito.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    ¿Puedo cancelar en cualquier momento?
                  </h3>
                  <p className="text-gray-300 text-sm">
                    Sí, puedes cancelar tu suscripción en cualquier momento sin penalizaciones.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}