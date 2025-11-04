import { 
  ArrowRight, 
  Search, 
  TrendingUp, 
  Mail, 
  History, 
  Users,
  ChevronDown,
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  Phone,
  MapPin,
  BarChart3,
  Shield,
  Zap
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { useState } from 'react';

interface LandingProps {
  onNavigate: (route: string) => void;
}

export function Landing({ onNavigate }: LandingProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortFilter, setSortFilter] = useState('volume');

  const navLinks = [
    { label: 'Mercados', href: '#markets' },
    { label: 'Portafolio', href: '#portfolio' },
    { label: 'Soporte', href: '#support' },
  ];

  const features = [
    {
      icon: TrendingUp,
      title: 'Compra/Venta',
      description: 'Ejecuta órdenes de compra y venta de acciones en tiempo real con cotizaciones actualizadas al segundo.',
    },
    {
      icon: Mail,
      title: 'Reportes por Email',
      description: 'Recibe reportes detallados de tu portafolio directamente en tu email cada mes o cuando lo solicites.',
    },
    {
      icon: History,
      title: 'Historial Completo',
      description: 'Accede a todo tu historial de transacciones, ganancias y pérdidas con filtros avanzados.',
    },
    {
      icon: Users,
      title: 'Código de Referidos',
      description: 'Invita amigos y obtén beneficios exclusivos. Gana comisiones por cada referido que se registre.',
    },
  ];

  const stocks = [
    { symbol: 'AAPL', name: 'Apple Inc.', price: 182.45, change: 2.34, volume: '58.2M', category: 'tech' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 141.20, change: -0.85, volume: '32.1M', category: 'tech' },
    { symbol: 'MSFT', name: 'Microsoft Corp.', price: 378.91, change: 1.56, volume: '44.7M', category: 'tech' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 178.25, change: 3.21, volume: '67.3M', category: 'retail' },
    { symbol: 'TSLA', name: 'Tesla Inc.', price: 242.84, change: -1.45, volume: '125.4M', category: 'automotive' },
    { symbol: 'JPM', name: 'JPMorgan Chase', price: 198.32, change: 0.92, volume: '28.6M', category: 'finance' },
  ];

  const filteredStocks = stocks.filter(stock => {
    const matchesSearch = stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          stock.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || stock.category === categoryFilter;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (sortFilter === 'volume') {
      return parseFloat(b.volume) - parseFloat(a.volume);
    } else {
      return b.price - a.price;
    }
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex h-16 items-center justify-between">
            <Logo size="md" />
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a 
                  key={link.label}
                  href={link.href} 
                  className="text-neutral-700 hover:text-brand-primary transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <Button 
              onClick={() => onNavigate('register')} 
              className="bg-brand-primary hover:bg-brand-primary/90 transition-all hover:shadow-lg"
            >
              Abrir cuenta
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-neutral-50 to-white py-20 md:py-32">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 border-brand-primary/20">
              ✓ Plataforma regulada por SIB Guatemala
            </Badge>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl text-neutral-900 mb-6">
              Invierte en acciones sin complicaciones
            </h1>
            
            <p className="text-xl text-neutral-600 mb-4 max-w-3xl mx-auto">
              Seguridad bancaria de primer nivel, reportes automáticos mensuales y comisiones transparentes desde el primer día.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button 
                size="lg" 
                className="bg-brand-primary hover:bg-brand-primary/90 transition-all hover:shadow-xl hover:scale-105"
                onClick={() => onNavigate('register')}
              >
                Comenzar gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-2 border-neutral-300 hover:border-brand-primary hover:text-brand-primary transition-all"
                onClick={() => onNavigate('login')}
              >
                Iniciar sesión
              </Button>
            </div>

            <div className="flex items-center justify-center gap-8 mt-12 text-sm text-neutral-500">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-brand-primary" />
                <span>Seguridad SSL</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-brand-primary" />
                <span>Sin comisiones ocultas</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-brand-primary" />
                <span>Reportes claros</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stock Search Section */}
      <section id="markets" className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl text-neutral-900 mb-4">
              Explora el mercado
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Busca acciones por nombre o ticker, filtra por categoría y ordena según tus preferencias
            </p>
          </div>

          {/* Search and Filters */}
          <div className="max-w-5xl mx-auto mb-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Search Input */}
              <div className="md:col-span-6 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                <Input
                  type="text"
                  placeholder="Buscar por nombre o ticker (ej. AAPL, Tesla)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 border-2 border-neutral-200 focus:border-brand-primary transition-colors"
                />
              </div>

              {/* Category Filter */}
              <div className="md:col-span-3">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="h-12 border-2 border-neutral-200 focus:border-brand-primary">
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    <SelectItem value="tech">Tecnología</SelectItem>
                    <SelectItem value="finance">Finanzas</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="automotive">Automotriz</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Filter */}
              <div className="md:col-span-3">
                <Select value={sortFilter} onValueChange={setSortFilter}>
                  <SelectTrigger className="h-12 border-2 border-neutral-200 focus:border-brand-primary">
                    <SelectValue placeholder="Ordenar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="volume">Mayor volumen</SelectItem>
                    <SelectItem value="price">Mayor precio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Stock Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {filteredStocks.map((stock) => (
              <Card 
                key={stock.symbol} 
                className="border-2 border-neutral-200 hover:border-brand-primary hover:shadow-2xl transition-all duration-300 cursor-pointer group"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="text-xl text-neutral-900 group-hover:text-brand-primary transition-colors">
                        {stock.symbol}
                      </div>
                      <div className="text-sm text-neutral-500">{stock.name}</div>
                    </div>
                    <Badge 
                      variant="secondary"
                      className={stock.change >= 0 ? 'bg-success-light text-success' : 'bg-danger-light text-danger'}
                    >
                      {stock.change >= 0 ? '+' : ''}{stock.change}%
                    </Badge>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-3xl text-neutral-900">${stock.price}</div>
                      <div className="text-sm text-neutral-500 mt-1">Vol: {stock.volume}</div>
                    </div>
                    <TrendingUp className={`h-6 w-6 ${stock.change >= 0 ? 'text-success' : 'text-danger rotate-180'}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredStocks.length === 0 && (
            <div className="text-center py-12">
              <p className="text-neutral-500">No se encontraron acciones con los filtros seleccionados</p>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section id="portfolio" className="py-20 bg-neutral-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl text-neutral-900 mb-4">
              Todo lo que necesitas para invertir
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Herramientas profesionales diseñadas para inversionistas modernos
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={index} 
                  className="border-2 border-neutral-200 hover:border-brand-primary hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group"
                >
                  <CardContent className="p-8">
                    <div className="w-14 h-14 rounded-xl bg-brand-primary/10 group-hover:bg-brand-primary flex items-center justify-center mb-6 transition-all">
                      <Icon className="h-7 w-7 text-brand-primary group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-xl text-neutral-900 mb-3 group-hover:text-brand-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-neutral-600">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Dashboard Demo Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl text-neutral-900 mb-4">
              Tu centro de control financiero
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Dashboard intuitivo con toda la información que necesitas en un solo lugar
            </p>
          </div>

          {/* Dashboard Mockup */}
          <div className="max-w-6xl mx-auto">
            <Card className="border-2 border-neutral-200 shadow-2xl overflow-hidden">
              <CardContent className="p-0">
                {/* Mockup Header */}
                <div className="bg-neutral-900 p-4 flex items-center gap-2">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-danger"></div>
                    <div className="w-3 h-3 rounded-full bg-warning"></div>
                    <div className="w-3 h-3 rounded-full bg-success"></div>
                  </div>
                  <div className="flex-1 text-center">
                    <div className="inline-block bg-neutral-800 rounded px-4 py-1 text-xs text-neutral-400">
                      app.tikalinvest.com/dashboard
                    </div>
                  </div>
                </div>

                {/* Mockup Content */}
                <div className="bg-gradient-to-br from-neutral-50 to-white p-8">
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Balance Card */}
                    <Card className="border-2 border-brand-primary/20 bg-white">
                      <CardContent className="p-6">
                        <div className="text-sm text-neutral-500 mb-2">Balance Total</div>
                        <div className="text-3xl text-neutral-900 mb-1">$45,230.80</div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-success-light text-success">+12.5%</Badge>
                          <span className="text-sm text-neutral-500">Este mes</span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Ganancias Card */}
                    <Card className="border-2 border-neutral-200 bg-white">
                      <CardContent className="p-6">
                        <div className="text-sm text-neutral-500 mb-2">Ganancias Hoy</div>
                        <div className="text-3xl text-success mb-1">+$1,250.40</div>
                        <div className="text-sm text-neutral-500">4 transacciones</div>
                      </CardContent>
                    </Card>

                    {/* Inversiones Card */}
                    <Card className="border-2 border-neutral-200 bg-white">
                      <CardContent className="p-6">
                        <div className="text-sm text-neutral-500 mb-2">Inversiones Activas</div>
                        <div className="text-3xl text-neutral-900 mb-1">8</div>
                        <div className="text-sm text-neutral-500">3 sectores</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Mini Chart */}
                  <Card className="border-2 border-neutral-200 bg-white mt-6">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-neutral-900">Rendimiento del Portafolio</div>
                        <Badge variant="secondary" className="bg-success-light text-success">
                          ↗ Tendencia positiva
                        </Badge>
                      </div>
                      <div className="h-32 flex items-end gap-2">
                        <div className="flex-1 bg-brand-primary/20 rounded-t" style={{ height: '45%' }}></div>
                        <div className="flex-1 bg-brand-primary/30 rounded-t" style={{ height: '60%' }}></div>
                        <div className="flex-1 bg-brand-primary/40 rounded-t" style={{ height: '55%' }}></div>
                        <div className="flex-1 bg-brand-primary/50 rounded-t" style={{ height: '75%' }}></div>
                        <div className="flex-1 bg-brand-primary/60 rounded-t" style={{ height: '85%' }}></div>
                        <div className="flex-1 bg-brand-primary rounded-t" style={{ height: '100%' }}></div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            <div className="text-center mt-8">
              <Button 
                size="lg" 
                className="bg-brand-primary hover:bg-brand-primary/90 transition-all hover:shadow-xl"
                onClick={() => onNavigate('register')}
              >
                Probar el dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="pricing" className="py-20 bg-gradient-to-r from-brand-primary to-brand-secondary">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-5xl text-white mb-6">
            Comienza a invertir hoy mismo
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Sin comisiones de apertura, sin mensualidades ocultas. Solo pagas por lo que inviertes.
          </p>
          <Button 
            size="lg" 
            className="bg-white text-brand-primary hover:bg-neutral-100 transition-all hover:shadow-2xl hover:scale-105"
            onClick={() => onNavigate('register')}
          >
            Abrir cuenta gratuita
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <p className="text-white/70 text-sm mt-6">
            ✓ Sin tarjeta de crédito • ✓ Registro en 2 minutos • ✓ Retiros gratuitos
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer id="support" className="bg-neutral-900 text-white py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
            {/* Logo and Description */}
            <div className="lg:col-span-2">
              <Logo size="md" variant="light" />
              <p className="text-neutral-400 mt-4 max-w-sm">
                TikalInvest es la plataforma de inversión más confiable de Guatemala. 
                Invierte con seguridad, transparencia y las mejores herramientas del mercado.
              </p>
              <div className="flex gap-3 mt-6">
                <a href="#" className="w-10 h-10 rounded-lg bg-neutral-800 hover:bg-brand-primary transition-all flex items-center justify-center hover:scale-110">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-lg bg-neutral-800 hover:bg-brand-primary transition-all flex items-center justify-center hover:scale-110">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-lg bg-neutral-800 hover:bg-brand-primary transition-all flex items-center justify-center hover:scale-110">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-lg bg-neutral-800 hover:bg-brand-primary transition-all flex items-center justify-center hover:scale-110">
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-white mb-4">Legal</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">Términos y Condiciones</a></li>
                <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">Política de Privacidad</a></li>
                <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">Política de Cookies</a></li>
                <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">Divulgación de Riesgos</a></li>
              </ul>
            </div>

            {/* Contacto */}
            <div>
              <h4 className="text-white mb-4">Contacto</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-neutral-400 hover:text-white transition-colors">
                  <Mail className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <a href="mailto:soporte@tikalinvest.com">
                    soporte@tikalinvest.com
                  </a>
                </li>
                <li className="flex items-start gap-2 text-neutral-400 hover:text-white transition-colors">
                  <Phone className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <a href="tel:+50212345678">
                    +502 1234-5678
                  </a>
                </li>
                <li className="flex items-start gap-2 text-neutral-400">
                  <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <span>Zona 10, Guatemala City</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-neutral-800 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-neutral-400">
                © 2025 TikalInvest. Todos los derechos reservados.
              </p>
              <p className="text-sm text-neutral-400">
                Regulado y supervisado por la Superintendencia de Bancos de Guatemala (SIB)
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
