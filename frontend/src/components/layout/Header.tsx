import { Menu, LogOut, Wallet, FileText, Settings, Shield } from 'lucide-react';
import { Logo } from '../common/Logo';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { useState, useEffect } from 'react';

interface HeaderProps {
  onMenuClick?: () => void;
  showMenu?: boolean;
  userName?: string;
  userEmail?: string;
  userRole?: 'user' | 'admin';
  onLogout?: () => void;
  onNavigate?: (route: string) => void;
}

export function Header({ onMenuClick, showMenu = false, userName = 'Usuario', userEmail = '', userRole = 'user', onLogout, onNavigate }: HeaderProps) {
  const [balance, setBalance] = useState('$0.00');
  const [balanceChange, setBalanceChange] = useState('+0.00%');

  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Cargar balance del backend
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        const token = localStorage.getItem('access_token');

        if (!token) return;

        const response = await fetch(`${API_BASE_URL}/portfolio/portfolio/dashboard_stats/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.stats) {
            const totalBalance = parseFloat(data.stats.total_balance);
            const gains = parseFloat(data.stats.total_gains);
            const gainsPercent = parseFloat(data.stats.gains_percentage);
            
            setBalance(`$${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
            setBalanceChange(`${gainsPercent >= 0 ? '+' : ''}${gainsPercent.toFixed(2)}% este mes`);
          }
        }
      } catch (error) {
        console.error('Error cargando balance:', error);
      }
    };

    fetchBalance();
    // Recargar cada 30 segundos
    const interval = setInterval(fetchBalance, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          {showMenu && (
            <Button variant="ghost" size="icon" onClick={onMenuClick} className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <Logo size="sm" />
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-brand-primary text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline-block">{userName}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              {/* User Info Section */}
              <DropdownMenuLabel>
                <div className="flex items-start gap-3 py-2">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-brand-primary text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-none mb-1">{userName}</p>
                    <p className="text-xs text-muted-foreground leading-none mb-2">{userEmail}</p>
                    {userRole === 'admin' && (
                      <span className="inline-flex items-center gap-1 text-xs text-warning">
                        <Shield className="h-3 w-3" />
                        Administrador
                      </span>
                    )}
                  </div>
                </div>
                {/* Quick Balance Info - Solo para usuarios normales */}
                {userRole !== 'admin' && (
                  <div className="mt-3 p-3 bg-brand-primary/5 rounded-lg border border-brand-primary/10">
                    <p className="text-xs text-muted-foreground mb-1">Balance Total</p>
                    <p className="text-lg text-neutral-900">{balance}</p>
                    <p className="text-xs text-success mt-1">{balanceChange}</p>
                  </div>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {/* Navigation Items - Solo para usuarios normales */}
              {userRole !== 'admin' && (
                <>
                  <DropdownMenuItem onClick={() => onNavigate?.('dashboard')}>
                    <Wallet className="mr-2 h-4 w-4" />
                    <span>Mi Dashboard</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={() => onNavigate?.('portfolio')}>
                    <FileText className="mr-2 h-4 w-4" />
                    <span>Mi Portafolio</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={() => onNavigate?.('settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configuración</span>
                  </DropdownMenuItem>
                </>
              )}

              {userRole === 'admin' && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onNavigate?.('admin')}>
                    <Shield className="mr-2 h-4 w-4" />
                    <span>Panel de Admin</span>
                  </DropdownMenuItem>
                </>
              )}

              <DropdownMenuSeparator />
              
              {/* Support & Logout */}
              <DropdownMenuItem onClick={onLogout} className="text-danger focus:text-danger">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar Sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
