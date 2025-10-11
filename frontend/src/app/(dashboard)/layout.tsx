'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import {
  TrendingUp, LayoutDashboard, Briefcase, ArrowLeftRight,
  Wallet, FileText, Star, User, Settings, LogOut, Menu, X,
  Bell, Search, ChevronDown
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isAuthenticated, refreshUser } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    refreshUser();
  }, [isAuthenticated, router, refreshUser]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Sesión cerrada exitosamente');
      router.push('/');
    } catch (error) {
      toast.error('Error al cerrar sesión');
    }
  };

  const navigation = user?.role === 'admin' ? [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Usuarios', href: '/admin/users', icon: User },
    { name: 'Acciones', href: '/admin/stocks', icon: TrendingUp },
    { name: 'Transacciones', href: '/admin/transactions', icon: ArrowLeftRight },
  ] : [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Portafolio', href: '/dashboard/portfolio', icon: Briefcase },
    { name: 'Mercado', href: '/dashboard/market', icon: TrendingUp },
    { name: 'Transacciones', href: '/dashboard/transactions', icon: ArrowLeftRight },
    { name: 'Wallet', href: '/dashboard/wallet', icon: Wallet },
    { name: 'Reportes', href: '/dashboard/reports', icon: FileText },
    { name: 'Favoritos', href: '/dashboard/watchlist', icon: Star },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 border-r border-gray-700 transform transition-transform lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-700">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">TikalInvest</span>
            </Link>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Balance Card */}
          <div className="p-4">
            <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-4">
              <div className="text-sm text-primary-100 mb-1">Balance Total</div>
              <div className="text-2xl font-bold text-white">
                {formatCurrency(user.balance + (user.portfolio_value || 0))}
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-primary-400/30">
                <div>
                  <div className="text-xs text-primary-100">Disponible</div>
                  <div className="text-sm font-semibold text-white">{formatCurrency(user.balance)}</div>
                </div>
                <div>
                  <div className="text-xs text-primary-100">Invertido</div>
                  <div className="text-sm font-semibold text-white">{formatCurrency(user.portfolio_value || 0)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 rounded-lg transition ${
                    isActive
                      ? 'bg-primary-500 text-white'
                      : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Menu */}
          <div className="p-4 border-t border-gray-700">
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center w-full px-4 py-3 rounded-lg hover:bg-gray-700 transition"
              >
                <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {user.full_name.charAt(0).toUpperCase()}
                </div>
                <div className="ml-3 flex-1 text-left">
                  <div className="text-sm font-medium text-white">{user.full_name}</div>
                  <div className="text-xs text-gray-400">{user.email}</div>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {isProfileOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden">
                  <Link
                    href="/dashboard/profile"
                    className="flex items-center px-4 py-3 hover:bg-gray-700 transition text-gray-300 hover:text-white"
                  >
                    <User className="w-4 h-4 mr-3" />
                    Mi Perfil
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center px-4 py-3 hover:bg-gray-700 transition text-gray-300 hover:text-white"
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    Configuración
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-3 hover:bg-gray-700 transition text-red-400 hover:text-red-300"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-gray-800/80 backdrop-blur-lg border-b border-gray-700">
          <div className="flex items-center justify-between h-16 px-4 lg:px-8">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex-1 max-w-2xl mx-4 hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar acciones..."
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="relative text-gray-400 hover:text-white transition">
                <Bell className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                  3
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}