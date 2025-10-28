'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@auth0/nextjs-auth0/client';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, error, isLoading } = useUser();
  const router = useRouter();
  const [djangoUser, setDjangoUser] = useState<any>(null);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // No autenticado, redirigir a login
        window.location.href = '/auth/login?returnTo=/admin';
      } else {
        // Verificar si es admin
        checkAdminAccess();
      }
    }
  }, [user, isLoading]);

  const checkAdminAccess = async () => {
    try {
      const response = await fetch('/auth/me');
      if (response.ok) {
        const data = await response.json();
        setDjangoUser(data.user);
        
        // Verificar si es admin
        if (data.user.role !== 'admin') {
          router.push('/dashboard');
        }
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error verificando acceso admin:', error);
      router.push('/dashboard');
    } finally {
      setCheckingAdmin(false);
    }
  };

  // Loading state
  if (isLoading || checkingAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] to-[#1a1f3a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-purple-400 text-xl">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  // Si no es admin, no mostrar nada (se está redirigiendo)
  if (!user || !djangoUser || djangoUser.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] to-[#1a1f3a]">
      {children}
    </div>
  );
}