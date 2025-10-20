'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
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
  Shield
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e27] flex items-center justify-center">
        <div className="text-cyan-400 text-xl">Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isAdmin = user.role === 'admin';

  const userMenuItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/dashboard/market', icon: TrendingUp, label: 'Mercado' },
    { href: '/dashboard/portfolio', icon: BarChart3, label: 'Portafolio' },
    { href: '/dashboard/trade', icon: TrendingUp, label: 'Trading' },
    { href: '/dashboard/wallet', icon: Wallet, label: 'Billetera' },
    { href: '/dashboard/transactions', icon: FileText, label: 'Transacciones' },
    { href: '/dashboard/reports', icon: FileText, label: 'Reportes' },
  ];

  const adminMenuItems = [
    { href: '/admin', icon: Shield, label: 'Admin Dashboard' },
    { href: '/admin/users', icon: Users, label: 'Usuarios' },
    { href: '/admin/stocks', icon: TrendingUp, label: 'Acciones' },
    { href: '/admin/transactions', icon: FileText, label: 'Transacciones' },
  ];

  const menuItems = isAdmin ? [...userMenuItems, ...adminMenuItems] : userMenuItems;

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

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
            <div className="hidden md:flex flex-col items-end">
              <p className="text-sm font-medium text-white">{user.name}</p>
              <p className="text-xs text-gray-400">{user.email}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard/profile"
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <User className="w-5 h-5 text-gray-400" />
              </Link>
              
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5 text-red-400" />
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
          {/* Balance Card - Removido user.balance */}
          <div className="mb-6 p-4 bg-gradient-to-br from-cyan-500/10 to-teal-500/5 rounded-lg border border-cyan-500/20">
            <p className="text-sm text-gray-400">Saldo disponible</p>
            <p className="text-lg font-bold text-cyan-400">
              $10,000.00
            </p>
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
                      ? 'bg-gradient-to-r from-cyan-500/20 to-teal-500/10 text-cyan-400 border border-cyan-500/30' 
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