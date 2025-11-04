import { User, Settings, LogOut, Wallet, FileText, Shield, HelpCircle } from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface FloatingUserMenuProps {
  user: {
    name: string;
    email: string;
    role: 'user' | 'admin';
  };
  onNavigate: (route: string) => void;
  onLogout: () => void;
}

export function FloatingUserMenu({ user, onNavigate, onLogout }: FloatingUserMenuProps) {
  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="lg"
            className="h-14 w-14 rounded-full shadow-lg bg-brand-primary hover:bg-brand-primary/90 hover:shadow-xl transition-all duration-200 hover:scale-110 relative group"
          >
            <div className="absolute inset-0 rounded-full bg-brand-primary animate-ping opacity-20 group-hover:opacity-0"></div>
            <Avatar className="h-12 w-12 relative z-10">
              <AvatarImage src="" alt={user.name} />
              <AvatarFallback className="bg-white text-brand-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72 mr-2 mb-2">
          <DropdownMenuLabel>
            <div className="flex items-start gap-3 py-2">
              <Avatar className="h-12 w-12">
                <AvatarImage src="" alt={user.name} />
                <AvatarFallback className="bg-brand-primary text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm leading-none mb-1">{user.name}</p>
                <p className="text-xs text-muted-foreground leading-none mb-2">{user.email}</p>
                {user.role === 'admin' && (
                  <span className="inline-flex items-center gap-1 text-xs text-warning">
                    <Shield className="h-3 w-3" />
                    Administrador
                  </span>
                )}
              </div>
            </div>
            {/* Quick Balance Info - Solo para usuarios normales */}
            {user.role !== 'admin' && (
              <div className="mt-3 p-3 bg-brand-primary/5 rounded-lg border border-brand-primary/10">
                <p className="text-xs text-muted-foreground mb-1">Balance Total</p>
                <p className="text-lg text-neutral-900">$45,800.80</p>
                <p className="text-xs text-success mt-1">+4.14% este mes</p>
              </div>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {/* Menú para usuarios normales */}
          {user.role !== 'admin' && (
            <>
              <DropdownMenuItem onClick={() => onNavigate('dashboard')}>
                <Wallet className="mr-2 h-4 w-4" />
                <span>Mi Dashboard</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => onNavigate('portfolio')}>
                <FileText className="mr-2 h-4 w-4" />
                <span>Mi Portafolio</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => onNavigate('settings')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Configuración</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              
              <DropdownMenuItem>
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Ayuda y Soporte</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
            </>
          )}

          {/* Menú para administradores */}
          {user.role === 'admin' && (
            <>
              <DropdownMenuItem onClick={() => onNavigate('admin')}>
                <Shield className="mr-2 h-4 w-4" />
                <span>Panel de Admin</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
            </>
          )}
          
          <DropdownMenuItem 
            onClick={onLogout}
            className="text-danger focus:text-danger focus:bg-danger-light"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Cerrar Sesión</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
