import { 
  LayoutDashboard, 
  TrendingUp, 
  Wallet, 
  History, 
  Settings,
  X,
  Store,
  Shield,
  Activity,
  TestTube2
} from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';
import { Badge } from '../ui/badge';

interface SidebarProps {
  activeRoute: string;
  onNavigate: (route: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
  userRole?: 'user' | 'admin';
}

// Menú para usuarios normales
const userMenuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', route: 'dashboard' },
  { icon: Store, label: 'Mercado', route: 'market' },
  { icon: TrendingUp, label: 'Trading', route: 'trading' },
  { icon: Wallet, label: 'Portafolio', route: 'portfolio' },
  { icon: History, label: 'Historial', route: 'history' },
  { icon: Settings, label: 'Configuración', route: 'settings' },
];

// Menú para administradores
  const adminMenuItems = [
    { label: 'Panel Admin', icon: LayoutDashboard, route: 'admin' },
    { label: 'Actividad del Sistema', icon: Activity, route: 'system-activity' },
    { label: 'Pruebas Responsive', icon: TestTube2, route: 'responsive-test' },
  ];

export function Sidebar({ activeRoute, onNavigate, isOpen = true, onClose, userRole = 'user' }: SidebarProps) {
  const menuItems = userRole === 'admin' ? adminMenuItems : userMenuItems;
  
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen w-64 border-r border-border bg-background transition-transform duration-300 md:sticky md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Mobile Close Button & Role Badge */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-border">
            {/* Role Badge */}
            <div className="hidden md:flex">
              {userRole === 'admin' ? (
                <Badge variant="default" className="bg-brand-primary">
                  <Shield className="mr-1 h-3 w-3" />
                  Administrador
                </Badge>
              ) : (
                <Badge variant="outline">
                  Usuario
                </Badge>
              )}
            </div>
            
            {/* Close button (mobile only) */}
            <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeRoute === item.route;
              
              return (
                <Button
                  key={item.route}
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start gap-3',
                    isActive && 'bg-brand-primary text-white hover:bg-brand-primary/90 hover:text-white'
                  )}
                  onClick={() => {
                    onNavigate(item.route);
                    onClose?.();
                  }}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Button>
              );
            })}
          </nav>

          {/* Footer Info */}
          <div className="p-4 border-t border-border">
            <div className="text-xs text-neutral-500">
              <p className="font-medium mb-1">TikalInvest</p>
              <p>Versión 1.0.0</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
