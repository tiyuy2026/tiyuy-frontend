import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = ['/login', '/', '/venta', '/alquiler', '/proyectos', '/propiedad', '/perfil-selector'];
const authRoutes = ['/login', '/registro'];
const protectedRoutes = ['/onboarding', '/dashboard'];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  console.log('=== MIDDLEWARE DEBUG ===');
  console.log('Ruta solicitada:', pathname);

  // Para middleware, no podemos acceder a localStorage directamente
  // Por ahora, permitimos acceso a dashboard y verificamos en el componente
  // Esta es una solución temporal hasta sincronizar localStorage con cookies
  
  console.log('Permitiendo acceso a:', pathname);
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
