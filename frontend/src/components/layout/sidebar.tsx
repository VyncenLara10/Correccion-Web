'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  TrendingUp,
  Briefcase,
  ArrowLeftRight,
  Wallet,
  Receipt,
  FileText,
  Star,
  Shield,
  Users
} from 'lucide-react';

interface SidebarProps {
  isAdmin?: boolean;
}

export function Sidebar({ isAdmin = false }: SidebarProps) {
  const pathname = usePathname();

  const userNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Mercado', href: '/market', icon: TrendingUp },
    { name: 'Mi Portafolio', href: '/portfolio', icon: Briefcase },
    { name: 'Operar', href: '/trade', icon: ArrowLeftRight },
    { name: 'Billetera', href: '/wallet', icon: Wallet },
    { name: 'Transacciones', href: '/transactions', icon: Receipt },
    { name: 'Reportes', href: '/reports', icon: FileText },
    { name: 'Watchlist', href: '/watchlist', icon: Star },
    { name: 'Referidos', href: '/dashboard/referrals', icon: Users },
  ];

  const adminNavigation = [
    { name: 'Admin Dashboard', href: '/admin', icon: Shield },
    { name: 'Usuarios', href: '/admin/users', icon: Users },
    { name: 'Acciones', href: '/admin/stocks', icon: TrendingUp },
    { name: 'Transacciones', href: '/admin/transactions', icon: Receipt },
  ];

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-[#1e293b]/50 backdrop-blur-sm border-r border-white/10 overflow-y-auto">
      <div className="p-4 space-y-6">
        {/* User Navigation */}
        <div>
          <h3 className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Navegación
          </h3>
          <nav className="space-y-1">
            {userNavigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-400'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Admin Navigation */}
        {isAdmin && (
          <div>
            <h3 className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Administración
            </h3>
            <nav className="space-y-1">
              {adminNavigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-purple-500/20 text-purple-400'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>
    </aside>
  );
}