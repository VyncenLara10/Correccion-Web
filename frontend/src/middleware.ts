import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth0 } from './lib/auth0';

export async function middleware(request: NextRequest) {
  console.log('Middleware ejecutándose para:', request.nextUrl.pathname);
  
  const authResponse = await auth0.middleware(request);

  // Dejar que Auth0 maneje sus rutas
  if (request.nextUrl.pathname.startsWith('/auth')) {
    console.log('Ruta de auth, delegando a Auth0');
    return authResponse;
  }

  // Proteger rutas específicas
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    console.log('Verificando acceso a dashboard...');
    const session = await auth0.getSession(request);
    
    if (!session) {
      console.log('No hay sesión, redirigiendo a login');
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('returnTo', '/api/dashboard');
      return NextResponse.redirect(loginUrl);
    }
    
    console.log('Sesión válida, acceso permitido');
  }

  return authResponse;
}

export const config = {
  matcher: [
    '/api/dashboard/:path*',
    '/auth/:path*'
  ]
};