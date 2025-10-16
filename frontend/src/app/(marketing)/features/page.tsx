'use client';

import { Shield, Zap, TrendingUp, Lock, BarChart3, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card2';
import { Button } from '@/components/ui/button2';
import Link from 'next/link';

export default function FeaturesPage() {
  const features = [
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Trading en Tiempo Real',
      description: 'Ejecuta operaciones instantáneamente con precios actualizados al segundo.'
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'Analytics Avanzado',
      description: 'Visualiza el rendimiento de tu portafolio con gráficos interactivos y reportes detallados.'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Seguridad Máxima',
      description: 'Encriptación de nivel bancario y autenticación de dos factores para proteger tus fondos.'
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Ejecución Rápida',
      description: 'Órdenes procesadas en milisegundos para aprovechar las mejores oportunidades.'
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: 'Custodia Segura',
      description: 'Tus activos están protegidos con sistemas de custodia regulados y seguros.'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Programa de Referidos',
      description: 'Gana comisiones por cada amigo que invites y empiece a invertir.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] to-[#1a1f3a]">
      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Características Poderosas
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Todo lo que necesitas para invertir de forma inteligente y segura
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105"
              >
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-6 text-cyan-400">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-16">
            <Link href="/register">
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-lg px-8 py-6">
                Comenzar Ahora
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}