import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = ['/login', '/', '/sale', '/rent', '/projects', '/property', '/profile-selector'];
const authRoutes = ['/login', '/register'];
const protectedRoutes = ['/onboarding', '/dashboard', '/dashboard/:path*'];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  console.log('=== MIDDLEWARE DEBUG ===');
  console.log('Ruta solicitada:', pathname);


  console.log('Permitiendo acceso a:', pathname);
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
