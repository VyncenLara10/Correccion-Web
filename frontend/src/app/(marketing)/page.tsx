'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button2';
import { TrendingUp, Shield, Zap, BarChart3 } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] to-[#1a1f3a]">
      {/* Navbar Simple */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1e293b]/95 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-cyan-400">Tikal</span>
              <span className="text-2xl font-bold text-white">Invest</span>
            </Link>

            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" className="text-white hover:text-cyan-400">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600">
                  Registrarse
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6">
            Invierte en tu Futuro con{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              TikalInvest
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12">
            La plataforma de trading más moderna y segura de Guatemala. 
            Empieza a invertir hoy con solo $10 USD.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Link href="/register">
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-lg px-8 py-6">
                Comenzar Gratis
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="text-lg px-8 py-6 border-cyan-500 text-cyan-400 hover:bg-cyan-500/10">
                Iniciar Sesión
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-cyan-400 mb-2">10,000+</div>
              <div className="text-gray-400">Usuarios Activos</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-cyan-400 mb-2">$50M+</div>
              <div className="text-gray-400">En Inversiones</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-cyan-400 mb-2">500+</div>
              <div className="text-gray-400">Acciones Disponibles</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-cyan-400 mb-2">24/7</div>
              <div className="text-gray-400">Soporte</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            ¿Por qué TikalInvest?
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-all">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Trading en Tiempo Real</h3>
              <p className="text-gray-400">Ejecuta operaciones instantáneas con precios actualizados</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-all">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">100% Seguro</h3>
              <p className="text-gray-400">Encriptación bancaria y autenticación de dos factores</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-all">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Comisiones Bajas</h3>
              <p className="text-gray-400">Solo 2% de comisión en el plan básico</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-all">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Analytics Avanzado</h3>
              <p className="text-gray-400">Reportes detallados y gráficos en tiempo real</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-cyan-500/20 to-blue-500/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            ¿Listo para Empezar?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Únete a miles de inversores que ya confían en TikalInvest
          </p>
          <Link href="/register">
            <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-lg px-8 py-6">
              Crear Cuenta Gratis
            </Button>
          </Link>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="py-8 px-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">
          <div className="text-gray-400">
            <p>&copy; 2025 TikalInvest. Todos los derechos reservados.</p>
          </div>
          <div className="flex gap-6">
            <Link href="/about" className="text-gray-400 hover:text-cyan-400">
              Nosotros
            </Link>
            <Link href="/contact" className="text-gray-400 hover:text-cyan-400">
              Contacto
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-cyan-400">
              Términos
            </Link>
            <Link href="/privacy" className="text-gray-400 hover:text-cyan-400">
              Privacidad
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}