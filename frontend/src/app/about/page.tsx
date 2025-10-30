'use client';

import Link from 'next/link';
import { TrendingUp, Shield, Users, Award, Target, Heart } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-gray-900/80 backdrop-blur-lg border-b border-gray-800 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">TikalInvest</span>
            </Link>

            <div className="flex items-center space-x-8">
              <Link href="/" className="hover:text-primary-500 transition">
                Inicio
              </Link>
              <Link href="/about" className="text-primary-500">
                Nosotros
              </Link>
              <Link href="/auth/login" className="hover:text-primary-500 transition">
                Iniciar Sesión
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-white">
            Sobre TikalInvest
          </h1>
          <p className="text-xl text-gray-400 mb-10">
            Democratizando el acceso a los mercados financieros en Guatemala y Latinoamérica
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 px-4 bg-gray-800/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">Nuestra Misión</h2>
              <p className="text-lg text-gray-300 mb-4">
                En TikalInvest, creemos que todos merecen acceso a oportunidades de inversión de clase mundial.
              </p>
              <p className="text-lg text-gray-300">
                Nuestra plataforma combina tecnología de vanguardia con educación financiera para empoderar 
                a inversionistas de todos los niveles en su camino hacia la libertad financiera.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-gray-800 rounded-xl">
                <Target className="w-8 h-8 text-primary-500 mb-3" />
                <h3 className="font-semibold mb-2">Innovación</h3>
                <p className="text-sm text-gray-400">Tecnología de punta</p>
              </div>
              <div className="p-6 bg-gray-800 rounded-xl">
                <Shield className="w-8 h-8 text-primary-500 mb-3" />
                <h3 className="font-semibold mb-2">Seguridad</h3>
                <p className="text-sm text-gray-400">Protección total</p>
              </div>
              <div className="p-6 bg-gray-800 rounded-xl">
                <Users className="w-8 h-8 text-primary-500 mb-3" />
                <h3 className="font-semibold mb-2">Comunidad</h3>
                <p className="text-sm text-gray-400">Crecimiento conjunto</p>
              </div>
              <div className="p-6 bg-gray-800 rounded-xl">
                <Heart className="w-8 h-8 text-primary-500 mb-3" />
                <h3 className="font-semibold mb-2">Transparencia</h3>
                <p className="text-sm text-gray-400">Sin costos ocultos</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Nuestros Valores</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Seguridad Primero',
                description: 'Protegemos tus inversiones con los más altos estándares de seguridad y encriptación.'
              },
              {
                icon: Award,
                title: 'Excelencia',
                description: 'Buscamos la excelencia en cada aspecto de nuestro servicio y tecnología.'
              },
              {
                icon: Users,
                title: 'Educación',
                description: 'Creemos en educar a nuestros usuarios para que tomen decisiones informadas.'
              }
            ].map((value, index) => (
              <div key={index} className="p-8 bg-gray-800/50 rounded-2xl border border-gray-700 hover:border-primary-500 transition">
                <value.icon className="w-12 h-12 text-primary-500 mb-4" />
                <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                <p className="text-gray-400">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-4 bg-gray-800/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold text-primary-500 mb-2">10K+</div>
              <div className="text-gray-400">Usuarios Activos</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-primary-500 mb-2">$50M+</div>
              <div className="text-gray-400">En Transacciones</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-primary-500 mb-2">25+</div>
              <div className="text-gray-400">Países</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-primary-500 mb-2">99.9%</div>
              <div className="text-gray-400">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            ¿Listo para comenzar tu viaje de inversión?
          </h2>
          <p className="text-xl text-gray-400 mb-10">
            Únete a miles de inversionistas que confían en TikalInvest
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center bg-primary-500 hover:bg-primary-600 text-white px-10 py-4 rounded-lg text-lg font-semibold transition"
          >
            Crear Cuenta Gratis
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 px-4">
        <div className="max-w-6xl mx-auto text-center text-gray-400">
          <p>© 2025 TikalInvest. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}