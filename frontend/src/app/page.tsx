'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { TrendingUp, Shield, Zap, Users, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const [stats, setStats] = useState({
    users: '10,000+',
    transactions: '$50M+',
    countries: '25+',
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-gray-900/80 backdrop-blur-lg border-b border-gray-800 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">TikalInvest</span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <Link href="/market" className="hover:text-primary-500 transition">
                Mercado
              </Link>
              <Link href="/about" className="hover:text-primary-500 transition">
                Nosotros
              </Link>
              <Link href="/login" className="hover:text-primary-500 transition">
                Iniciar Sesión
              </Link>
              <Link
                href="/register"
                className="bg-primary-500 hover:bg-primary-600 px-6 py-2 rounded-lg transition"
              >
                Comenzar
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
              Invierte en el Futuro
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-3xl mx-auto">
              Accede a los mercados globales con TikalInvest. Compra y vende acciones
              con comisiones ultra bajas y en tiempo real.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition flex items-center justify-center"
              >
                Comenzar Ahora
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                href="/market"
                className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition"
              >
                Explorar Mercado
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20"
          >
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-700">
              <div className="text-4xl font-bold text-primary-500 mb-2">{stats.users}</div>
              <div className="text-gray-400">Usuarios Activos</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-700">
              <div className="text-4xl font-bold text-primary-500 mb-2">{stats.transactions}</div>
              <div className="text-gray-400">En Transacciones</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-700">
              <div className="text-4xl font-bold text-primary-500 mb-2">{stats.countries}</div>
              <div className="text-gray-400">Países</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">¿Por qué TikalInvest?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Zap,
                title: 'Trading en Tiempo Real',
                description: 'Ejecuta operaciones al instante con datos del mercado en tiempo real',
              },
              {
                icon: Shield,
                title: 'Seguridad Avanzada',
                description: 'Tus inversiones protegidas con encriptación de nivel bancario',
              },
              {
                icon: TrendingUp,
                title: 'Comisiones Bajas',
                description: 'Sólo 0.5% de comisión por operación, sin costos ocultos',
              },
              {
                icon: Users,
                title: 'Programa de Referidos',
                description: 'Gana $5 por cada amigo que se registre con tu código',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-700 hover:border-primary-500 transition"
              >
                <div className="w-12 h-12 bg-primary-500/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Cómo Funciona</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                step: '01',
                title: 'Regístrate',
                description: 'Crea tu cuenta en menos de 2 minutos y verifica tu identidad',
              },
              {
                step: '02',
                title: 'Deposita Fondos',
                description: 'Transfiere dinero a tu cuenta con comisiones mínimas',
              },
              {
                step: '03',
                title: 'Comienza a Invertir',
                description: 'Compra y vende acciones de empresas globales en tiempo real',
              },
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="text-6xl font-bold text-primary-500/20 mb-4">{step.step}</div>
                <h3 className="text-2xl font-semibold mb-4">{step.title}</h3>
                <p className="text-gray-400">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Comienza a Invertir Hoy
          </h2>
          <p className="text-xl text-gray-400 mb-10">
            Únete a miles de inversionistas que confían en TikalInvest
          </p>
          <Link
            href="/register"
            className="inline-flex items-center bg-primary-500 hover:bg-primary-600 text-white px-10 py-4 rounded-lg text-lg font-semibold transition"
          >
            Crear Cuenta Gratis
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">TikalInvest</span>
              </div>
              <p className="text-gray-400">
                La plataforma de trading más confiable de Guatemala
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Producto</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/market" className="hover:text-primary-500">Mercado</Link></li>
                <li><Link href="/pricing" className="hover:text-primary-500">Precios</Link></li>
                <li><Link href="/features" className="hover:text-primary-500">Características</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Compañía</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-primary-500">Nosotros</Link></li>
                <li><Link href="/careers" className="hover:text-primary-500">Carreras</Link></li>
                <li><Link href="/contact" className="hover:text-primary-500">Contacto</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/terms" className="hover:text-primary-500">Términos</Link></li>
                <li><Link href="/privacy" className="hover:text-primary-500">Privacidad</Link></li>
                <li><Link href="/security" className="hover:text-primary-500">Seguridad</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            © 2025 TikalInvest. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}