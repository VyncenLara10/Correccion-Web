import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { AnimatePresence } from 'motion/react';
import { Toaster } from './components/ui/sonner';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar1';
import { PageTransition } from './components/common/PageTransition';
import { Landing } from './components/screens/Landing';
import { Login } from './components/screens/Login';
import { Register } from './components/screens/Register';
import { ForgotPassword } from './components/screens/ForgotPassword';
import { EmailVerification } from './components/screens/EmailVerification';
import { SecurityQuestions } from './components/screens/SecurityQuestions';
import { Dashboard } from './components/screens/Dashboard';
import { Trading } from './components/screens/Trading';
import { Portfolio } from './components/screens/Portfolio';
import { History } from './components/screens/History';
import { Settings } from './components/screens/Settings';
import { Admin } from './components/screens/Admin';
import { MarketCatalog } from './components/screens/MarketCatalog';
import { StockDetail } from './components/screens/StockDetail';
import { UserManagement } from './components/screens/UserManagement';
import { SystemActivity } from './components/screens/SystemActivity';
import { ResponsiveTest } from './components/screens/ResponsiveTest';
import { RequestReport } from './components/screens/RequestReport';

type Route = 'landing' | 'login' | 'register' | 'forgot-password' | 'email-verification' | 'security-questions' | 'dashboard' | 'trading' | 'portfolio' | 'history' | 'settings' | 'admin' | 'market' | 'stock-detail' | 'user-management' | 'system-activity' | 'responsive-test' | 'request-report';

interface User {
  name?: string;
  first_name?: string;
  last_name?: string;
  email: string;
  role: 'user' | 'admin';
}

// Función auxiliar para obtener el nombre completo del usuario
const getFullName = (user: any): string => {
  if (user.name) return user.name;
  if (user.first_name || user.last_name) {
    return `${user.first_name || ''} ${user.last_name || ''}`.trim();
  }
  return 'Usuario';
};

const getCurrentRoute = (): Route => {
  const path = window.location.pathname.replace(/\/$/, '').split('/').pop() || 'landing';
  const validRoutes: Route[] = ['landing', 'login', 'register', 'forgot-password', 'email-verification', 'security-questions', 'dashboard', 'trading', 'portfolio', 'history', 'settings', 'admin', 'market', 'stock-detail', 'user-management', 'system-activity', 'responsive-test', 'request-report'];
  return validRoutes.includes(path as Route) ? (path as Route) : 'landing';
};

export default function App() {
  const { isAuthenticated: isAuth0Authenticated, user: auth0User, isLoading, getAccessTokenSilently } = useAuth0();
  const [currentRoute, setCurrentRoute] = useState<Route>(getCurrentRoute());
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

  // Restaurar sesión al cargar
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        // Restaurar también la ruta actual desde la URL
        setCurrentRoute(getCurrentRoute());
      } catch (e) {
        console.error('Error restaurando sesión:', e);
      }
    }
  }, []);

  // Manejar autenticación Auth0
  useEffect(() => {
    if (isAuth0Authenticated && auth0User && !user) {
      const userData: User = {
        name: auth0User.name || auth0User.email || 'Usuario Auth0',
        email: auth0User.email || '',
        role: 'user',
      };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('auth0_user', JSON.stringify(auth0User));
      
      // Obtener token de acceso
      getAccessTokenSilently()
        .then((token) => {
          localStorage.setItem('access_token', token);
        })
        .catch((error) => {
          console.error('Error obteniendo token:', error);
        });

      // Redirigir al dashboard
      setCurrentRoute('dashboard');
      window.history.pushState(null, '', '/dashboard');
    }
  }, [isAuth0Authenticated, auth0User, user, getAccessTokenSilently]);

  // Sincronizar con cambios de URL
  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(getCurrentRoute());
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const isUserAuthenticated = user !== null;
  const isPublicRoute = ['landing', 'login', 'register', 'forgot-password', 'email-verification', 'security-questions'].includes(currentRoute);

  const handleNavigate = (route: string, data?: any) => {
    if (route === 'stock-detail' && data?.symbol) {
      setSelectedStock(data.symbol);
    }
    setCurrentRoute(route as Route);
    window.history.pushState(null, '', `/${route}`);
    setSidebarOpen(false);
  };

  const handleLogin = (email: string, password: string) => {
    // Obtener datos del usuario guardados en localStorage por Login.tsx
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setCurrentRoute(userData.role === 'admin' ? 'admin' : 'dashboard');
    } else {
      // Fallback para login mock (sin backend)
      const isAdmin = email.includes('admin');
      const userData: User = {
        name: isAdmin ? 'Administrador' : 'Usuario Demo',
        email,
        role: isAdmin ? 'admin' : 'user',
      };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      setCurrentRoute(isAdmin ? 'admin' : 'dashboard');
    }
  };

  const handleRegister = (data: { name: string; email: string; password: string; referralCode?: string }) => {
    setCurrentRoute('email-verification');
  };

  const handleSecurityQuestionsComplete = () => {
    // After security questions, create the user and go to dashboard
    const userData: User = {
      name: user.name,
      email: user.email,
      role: 'user',
    };
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    setCurrentRoute('dashboard');
    window.history.pushState(null, '', '/dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentRoute('landing');
  };

  // Render public routes
  if (isPublicRoute) {
    return (
      <>
        <AnimatePresence mode="wait">
          {currentRoute === 'landing' && (
            <PageTransition key="landing">
              <Landing onNavigate={handleNavigate} />
            </PageTransition>
          )}
          {currentRoute === 'login' && (
            <PageTransition key="login">
              <Login onNavigate={handleNavigate} onLogin={handleLogin} />
            </PageTransition>
          )}
          {currentRoute === 'register' && (
            <PageTransition key="register">
              <Register onNavigate={handleNavigate} onRegister={handleRegister} />
            </PageTransition>
          )}
          {currentRoute === 'forgot-password' && (
            <PageTransition key="forgot-password">
              <ForgotPassword onNavigate={handleNavigate} />
            </PageTransition>
          )}
          {currentRoute === 'email-verification' && (
            <PageTransition key="email-verification">
              <EmailVerification onNavigate={handleNavigate} />
            </PageTransition>
          )}
          {currentRoute === 'security-questions' && (
            <PageTransition key="security-questions">
              <SecurityQuestions onNavigate={handleNavigate} onComplete={handleSecurityQuestionsComplete} />
            </PageTransition>
          )}
        </AnimatePresence>
        
        <Toaster />
      </>
    );
  }

  // Redirect to landing if not authenticated
  if (!isUserAuthenticated) {
    return <Landing onNavigate={handleNavigate} />;
  }

  // Render authenticated routes with layout
  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50">
      <Sidebar
        activeRoute={currentRoute}
        onNavigate={handleNavigate}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userRole={user?.role}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          showMenu={true}
          userName={user?.name || getFullName(user)}
          userEmail={user?.email}
          userRole={user?.role}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
        />

        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {currentRoute === 'market' ? (
              <PageTransition key="market">
                <MarketCatalog onNavigate={handleNavigate} />
              </PageTransition>
            ) : currentRoute === 'stock-detail' && selectedStock ? (
              <PageTransition key="stock-detail">
                <div className="container mx-auto p-4 md:p-6 max-w-7xl">
                  <StockDetail 
                    symbol={selectedStock} 
                    onBack={() => handleNavigate('market')} 
                  />
                </div>
              </PageTransition>
            ) : currentRoute === 'request-report' ? (
              <PageTransition key="request-report">
                <RequestReport onNavigate={handleNavigate} />
              </PageTransition>
            ) : (
              <PageTransition key={currentRoute}>
                <div className="container mx-auto p-4 md:p-6 max-w-7xl">
                  {currentRoute === 'dashboard' && <Dashboard onNavigate={handleNavigate} />}
                  {currentRoute === 'trading' && <Trading />}
                  {currentRoute === 'portfolio' && <Portfolio onNavigate={handleNavigate} />}
                  {currentRoute === 'history' && <History />}
                  {currentRoute === 'settings' && <Settings />}
                  {currentRoute === 'admin' && user?.role === 'admin' && <Admin />}
                  {currentRoute === 'user-management' && user?.role === 'admin' && <UserManagement />}
                  {currentRoute === 'system-activity' && user?.role === 'admin' && <SystemActivity />}
                  {currentRoute === 'responsive-test' && user?.role === 'admin' && <ResponsiveTest />}
                </div>
              </PageTransition>
            )}
          </AnimatePresence>
        </main>
      </div>

      <Toaster />
    </div>
  );
}
