'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { User, Settings, LogOut, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button2';
import { Sidebar } from '@/components/layout/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
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

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] to-[#1a1f3a]">
      {/* Top Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1e293b]/95 backdrop-blur-sm border-b border-white/10">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo + Mobile Menu Button */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
              >
                {sidebarOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
              
              <Link href="/dashboard" className="flex items-center">
                <span className="text-2xl font-bold text-cyan-400">Tikal</span>
                <span className="text-2xl font-bold text-white">Invest</span>
              </Link>
            </div>

            {/* User Info + Actions */}
            <div className="flex items-center gap-4">
              {/* Balance - Hidden on mobile */}
              <div className="hidden md:block text-right">
                <p className="text-sm text-gray-400">Saldo disponible</p>
                <p className="text-lg font-bold text-cyan-400">
                  ${user.balance?.toFixed(2) || '0.00'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Link href="/profile">
                  <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                    <User className="w-5 h-5" />
                  </Button>
                </Link>
                
                <Link href="/settings">
                  <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                    <Settings className="w-5 h-5" />
                  </Button>
                </Link>

                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-red-400"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Balance */}
        <div className="md:hidden px-4 pb-3 border-t border-white/10 pt-2">
          <p className="text-sm text-gray-400">Saldo disponible</p>
          <p className="text-lg font-bold text-cyan-400">
            ${user.balance?.toFixed(2) || '0.00'}
          </p>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Desktop always visible, Mobile conditional */}
      <div
        className={`fixed left-0 top-16 bottom-0 z-40 transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar isAdmin={isAdmin} />
      </div>

      {/* Main Content */}
      <main className="pt-16 lg:ml-64 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}