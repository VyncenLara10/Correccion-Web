'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@auth0/nextjs-auth0/client';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Wallet, 
  FileText,
  Menu,
  X,
  LogOut,
  User,
  Settings,
  BarChart3,
  Users,
  Shield,
  Star,
  Bell
} from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, error } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [balance, setBalance] = useState(10000.00);

  useEffect(() => {
    if (error) {
      console.error('Auth error:', error);
      router.push('/auth/login');
      return;
    }

    if (!isLoading && !user) {
      router.push('/auth/login');
      return;
    }
  }, [user, isLoading, error, router]);

  const handleLogout = () => {
    window.location.href = '/api/auth/logout';
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] to-[#1a1f3a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-cyan-400 text-xl">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario después de cargar, no mostrar nada (se está redirigiendo)
  if (!user) {
    return null;
  }

  // Determinar si es admin
  const isAdmin = user.role === 'admin' || user.email?.includes('admin');

  const userMenuItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/dashboard/market', icon: TrendingUp, label: 'Mercado' },
    { href: '/dashboard/portfolio', icon: BarChart3, label: 'Portafolio' },
    { href: '/dashboard/trade', icon: TrendingUp, label: 'Trading' },
    { href: '/dashboard/wallet', icon: Wallet, label: 'Billetera' },
    { href: '/dashboard/transactions', icon: FileText, label: 'Transacciones' },
    { href: '/dashboard/watchlist', icon: Star, label: 'Watchlist' },
    { href: '/dashboard/reports', icon: FileText, label: 'Reportes' },
  ];

  const adminMenuItems = [
    { href: '/admin', icon: Shield, label: 'Admin Dashboard' },
    { href: '/admin/users', icon: Users, label: 'Usuarios' },
    { href: '/admin/stocks', icon: TrendingUp, label: 'Acciones' },
    { href: '/admin/transactions', icon: FileText, label: 'Transacciones' },
  ];

  const menuItems = isAdmin ? [...userMenuItems, ...adminMenuItems] : userMenuItems;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] to-[#1a1f3a]">
      {/* Top Navbar */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-[#0a0e27]/95 backdrop-blur-sm border-b border-white/10 z-50">
        <div className="h-full px-4 flex items-center justify-between">
          {/* Logo y Toggle */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {sidebarOpen ? (
                <X className="w-6 h-6 text-white" />
              ) : (
                <Menu className="w-6 h-6 text-white" />
              )}
            </button>
            
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">TI</span>
              </div>
              <span className="text-xl font-bold text-white hidden sm:block">
                TikalInvest
              </span>
            </Link>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors relative">
              <Bell className="w-5 h-5 text-gray-400" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <div className="hidden md:flex flex-col items-end">
              <p className="text-sm font-medium text-white">
                {user.name || user.email?.split('@')[0]}
              </p>
              <p className="text-xs text-gray-400">{user.email}</p>
            </div>
            
            <div className="flex items-center gap-2">
              {user.picture ? (
                <img 
                  src={user.picture} 
                  alt={user.name || 'User'} 
                  className="w-8 h-8 rounded-full border-2 border-cyan-500"
                />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {(user.name || user.email || 'U')[0].toUpperCase()}
                  </span>
                </div>
              )}
              
              <Link
                href="/dashboard/profile"
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <User className="w-5 h-5 text-gray-400" />
              </Link>
              
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-red-500/20 rounded-lg transition-colors group"
                title="Cerrar sesión"
              >
                <LogOut className="w-5 h-5 text-red-400 group-hover:text-red-300" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-16 left-0 bottom-0 w-64 bg-[#0a0e27]/95 backdrop-blur-sm
          border-r border-white/10 z-40 transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="h-full overflow-y-auto p-4">
          {/* Balance Card */}
          <div className="mb-6 p-4 bg-gradient-to-br from-cyan-500/10 to-teal-500/5 rounded-lg border border-cyan-500/20">
            <p className="text-sm text-gray-400 mb-1">Saldo disponible</p>
            <p className="text-2xl font-bold text-cyan-400">
              Q {balance.toFixed(2)}
            </p>
            <div className="mt-3 flex gap-2">
              <Link
                href="/dashboard/wallet?action=deposit"
                className="flex-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 text-xs font-medium py-2 px-3 rounded-lg transition text-center"
              >
                Depositar
              </Link>
              <Link
                href="/dashboard/wallet?action=withdraw"
                className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-medium py-2 px-3 rounded-lg transition text-center"
              >
                Retirar
              </Link>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                    ${isActive 
                      ? 'bg-gradient-to-r from-cyan-500/20 to-teal-500/10 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/10' 
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Admin Badge */}
          {isAdmin && (
            <div className="mt-6 p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-purple-400">
                  Modo Administrador
                </span>
              </div>
            </div>
          )}

          {/* User Info Card */}
          <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center gap-3 mb-3">
              {user.picture ? (
                <img 
                  src={user.picture} 
                  alt={user.name || 'User'} 
                  className="w-10 h-10 rounded-full border-2 border-cyan-500"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">
                    {(user.name || user.email || 'U')[0].toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user.name || 'Usuario'}
                </p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>
            </div>
            <Link
              href="/dashboard/settings"
              className="flex items-center justify-center gap-2 w-full bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-medium py-2 px-3 rounded-lg transition"
            >
              <Settings className="w-4 h-4" />
              Configuración
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="pt-16 lg:pl-64 min-h-screen">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}